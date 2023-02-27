/**
 * Allows users to acquire and relinquish roles by reacting to a message.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 23/06/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import emojiRegex = require("emoji-regex/RGI_Emoji")
import { ReactionRolesContext, ReactionRoleMessage } from "../model/reaction_roles_context"
import { Bot } from "../bot"
import { removeBotMentions } from "../util/remove_mentions"
import { log } from "../log"
import { parseEmoji } from "../util/parse_emoji"
import { ServerFeature, MessageContext, DiscordReaction, DiscordUser } from "./feature"

export class ReactionRolesFeature extends ServerFeature {
    private context?: ReactionRolesContext

    public constructor(bot: Bot, name: string, server: Discord.Guild) {
        super(bot, name, server)
    }

    public handlesMessage(context: MessageContext<this>): boolean {
        if (!super.handlesMessage(context)) {
            return false
        }
        const msgTxt = removeBotMentions(this.bot, context.message).trim()
        if (msgTxt.startsWith("reaction role")) {
            return true
        }
        return false
    }

    public handleMessage(context: MessageContext<this>): boolean {
        this.handleMessageAsync(context)
        return true
    }

    public onMessageReactionAdd(reaction: DiscordReaction,
                                user: DiscordUser): boolean {
        this.handleReaction(reaction, user, "add")
        return true
    }

    public onMessageReactionRemove(reaction: DiscordReaction,
                                   user: DiscordUser): boolean {
        this.handleReaction(reaction, user, "remove")
        return true
    }

    private sendHelp(context: MessageContext<this>, error?: string): void {
        if (!this.bot?.user?.id) {
            return
        }
        let message = ""
        if (error) {
            message += `${error}\n\n`
        }
        message += "Usage: \n" +
            `<@${this.bot.user.id}> reaction role\n` +
            ":emoji: \"role name\" Description text\n" +
            ":other_emoji: \"other role name\" Another description text"
        context.sendReply(message)
    }

    // private async checkPermissions(channel: Discord.GuildChannel): Promise<boolean> {
    //     return true
    // }

    private async handleMessageAsync(context: MessageContext<this>): Promise<void> {
        const tokens = this.commandTokens(context)
        const tokenizedLines = tokens.reduce<string[][]>((lines, val) => {
            if (lines.length === 0 || val === "\n") {
                lines.push([])
            } else {
                lines[lines.length - 1].push(val)
            }
            return lines
        }, [])
        if (tokenizedLines.length < 2) {
            this.sendHelp(context)
            return
        }
        if (!this.context) {
            this.context = await this.loadContext()
        }
        if (!context.message.guild) {
            // Ignore messages not in a guild
            return
        }
        if (context.message.channel.type !== Discord.ChannelType.GuildText) {
            return
        }
        const guild = context.message.guild
        const roles = await guild.roles.fetch()
        const newReactRoleMsg: ReactionRoleMessage = {
            id: "PENDING",
            map: {},
        }
        const embed = new Discord.EmbedBuilder()
        for (const commandLine of tokenizedLines.splice(1)) {
            if (commandLine.length < 3) {
                this.sendHelp(context)
                return
            }
            const emojiId = commandLine[0]
            const roleInput = commandLine[1]
            const desc = commandLine.splice(2).join(" ")
            const role = roles.find(r => r.name === roleInput)
            const regex = emojiRegex()
            const customEmoji = parseEmoji(emojiId)
            if (!regex.test(emojiId) && customEmoji.length === 0) {
                // Not a valid emoji
                this.sendHelp(context, `error: "${emojiId}" is not a valid emoji. Try a custom one?`)
                return
            }
            if (customEmoji.length > 0) {
                const customId = customEmoji[0].id
                const customEmojiObj = guild.emojis.cache.find(em => em.id === customId)
                if (!customEmojiObj) {
                    // This custom emoji is not available in this guild
                    this.sendHelp(context, `error: "${emojiId}" is not a valid emoji. ` +
                        "Custom emojis must be in this server. Emojis from other servers " +
                        "using Discord Nitro aren't allowed by Bots.")
                    return
                }
            }
            if (!role) {
                // Invalid input? Role not found
                this.sendHelp(context, `error: can't find role "${roleInput}" in this server.`)
                return
            }
            const roleId = role.id
            newReactRoleMsg.map[emojiId] = {
                emojiId,
                desc,
                roleId,
            }
            // embed.addField(emojiId, desc, false)
            embed.addFields({name: emojiId, value: desc, inline: false})
        }

        // Create the message and post it to the channel.
        const title = "Add or remove one of these reactions on this message to join or leave a role!"
        const message = await context.message.channel.send({
            content: title,
            embeds: [embed],
        })
        newReactRoleMsg.id = message.id

        // Save this message to persistent storage.
        this.context.messages.push(newReactRoleMsg)
        this.context.save()

        // Add reactions to the message from the Bot for user convenience.
        for (const emojiId of Object.keys(newReactRoleMsg.map)) {
            const customEmoji = parseEmoji(emojiId)
            if (customEmoji.length > 0) {
                message.react(customEmoji[0].id)
            } else {
                message.react(emojiId)
            }
        }
    }

    private async handleReaction(reaction: DiscordReaction,
                                 user: DiscordUser,
                                 operation: "add" | "remove"): Promise<void> {
        if (this.bot.user && this.bot.user.id === user.id) {
            // Ignore reactions from the bot itself
            return
        }
        if (!this.context) {
            this.context = await this.loadContext()
        }
        // Bail early if this reaction isn't on a Reaction Role Message
        const reactionRoleMessage = this.context.messages.find(m => m.id === reaction.message.id)
        if (!reactionRoleMessage) {
            return
        }

        if (reaction.message.partial) {
            // Fetch the full message if our cache only has partial
            await reaction.message.fetch().catch(log)
        }

        if (user.partial) {
            // Fetch the full user if our cache only has partial
            user = await user.fetch()
        }

        let emojiStr: string
        if (reaction.emoji.id) {
            // If it has an ID it is a custom emoji
            emojiStr = `<:${reaction.emoji.identifier}>`
        } else if (reaction.emoji.name) {
            // Unicode emoji
            emojiStr = reaction.emoji.name
        } else {
            // ???
            return
        }
        const roleData = reactionRoleMessage.map[emojiStr]
        // Remove any reactions that aren't in the map
        if (!roleData) {
            reaction.remove().catch(log)
            return
        }
        if (!reaction.message.guild || !reaction.message.member) {
            // Ignore reactions on messages not in a guild
            return
        }
        const role = await reaction.message.guild.roles.fetch(roleData.roleId)
        if (!role) {
            // It must've been deleted?
            return
        }
        const member = await reaction.message.guild.members.fetch(user.id)
        if (operation === "add") {
            member.roles.add(role)
        } else if (operation === "remove") {
            member.roles.remove(role)
        }
    }

    private async loadContext(): Promise<ReactionRolesContext> {
        const myContext = new ReactionRolesContext(this.bot, this.server.id)
        await myContext.load()
        return myContext
    }
}
