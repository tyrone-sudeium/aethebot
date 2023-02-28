/**
 * A ghetto admin interface.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 11/05/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import { Bot } from "../../bot"
import { assertIsError, log } from "../../log"
import { User } from "../../model/user"
import { GlobalFeature, MessageContext } from "../feature"
import * as TwitThis from "../ping/twit_this"

export type AdminAction = |
"Any" |
"ListServers" |
"Redis" |
"Twit" |
"DeployCommands"

export async function canPerformAction(action: AdminAction, context: MessageContext<GlobalFeature>): Promise<boolean> {
    const user = new User(context.feature.bot, context.message.author.id)
    await user.load()
    if (!user.isAdmin) {
        context.sendNegativeReply()
        return false
    }
    if (context.message.channel.type !== Discord.ChannelType.DM) {
        context.sendNegativeReply("don't do admin commands in public you nong")
        return false
    }
    return true
}

export class AdminFeature extends GlobalFeature {
    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.setupDefaultAdminUser()
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        if (tokens.length < 1) {
            return false
        }
        if (tokens[0].toLowerCase() !== "admin") {
            return false
        }

        this.handleMessageAsync(context)
        return true
    }

    private async handleMessageAsync(context: MessageContext<this>): Promise<void> {
        if (!(await canPerformAction("Any", context))) {
            return
        }
        const tokens = this.commandTokens(context)
        if (tokens.length < 2) {
            context.sendNegativeReply("unknown command")
            return
        }
        if (tokens[1].toLowerCase() === "servers") {
            if (!(await canPerformAction("ListServers", context))) {
                return
            }
            const servers = this.bot.joinedServers()
                .map(guild => `${guild.name} (${guild.id})`)
                .join(", ")
            context.sendReply(servers)
            return
        } else if (tokens[1].toLowerCase() === "twit") {
            this.handleTwit(context, tokens)
            return
        } else if (tokens.length > 2 &&
            tokens[1].toLowerCase() === "deploy" &&
            tokens[2].toLowerCase() === "commands")
        {
            this.handleDeployCommands(context)
            return
        }

        context.sendNegativeReply("unknown command")
    }

    private async handleTwit(context: MessageContext<this>, tokens: string[]): Promise<void> {
        if (!(await canPerformAction("Twit", context))) {
            return
        }
        if (tokens.length < 3) {
            context.sendNegativeReply()
            return
        }
        const commands = new Set(["remove", "size"])
        const command = tokens[2].toLowerCase()
        if (!commands.has(command)) {
            context.sendNegativeReply()
            return
        }
        if (command === "remove") {
            if (tokens.length < 4) {
                context.sendNegativeReply()
                return
            }
            const key = tokens[3].toLowerCase()
            const strData = await this.bot.brain.get(TwitThis.BRAIN_KEY)
            if (!strData) {
                context.sendNegativeReply("no custom twits")
                return
            }
            const json: TwitThis.PersistedTwits = JSON.parse(strData)
            if (!json[key]) {
                context.sendNegativeReply(`no custom tweet stored with id '${key}'`)
                return
            }
            delete json[key]
            const newJson = JSON.stringify(json)
            await this.bot.brain.set(TwitThis.BRAIN_KEY, newJson)
            context.sendReply("ok")
            return
        } else if (command === "size") {
            const strData = await this.bot.brain.get(TwitThis.BRAIN_KEY)
            let size = 0
            if (strData) {
                size = new Buffer(strData, "utf8").byteLength
            }
            context.sendReply(`${size} bytes.`)
            return
        }
    }

    private async handleDeployCommands(context: MessageContext<this>): Promise<void> {
        const slashCommands = this.bot.getAllSlashCommands()
        const rest = new Discord.REST({ version: "10" }).setToken(this.bot.token)
        const appId = this.bot.applicationId
        try {
            const data = slashCommands.map(s => s.toJSON())
            log(`admin: deploy-commands: deploying: ${JSON.stringify(data)}`)
            await rest.put(Discord.Routes.applicationCommands(appId), { body: data })
            context.sendReply("ok")
            return
        } catch (error) {
            assertIsError(error)
            log(`admin: deploy-commands error: ${error.message}`, "always")
            context.sendReply("oops something cocked up, check the logs")
        }
    }

    private async setupDefaultAdminUser(): Promise<void> {
        const userId = process.env.DEFAULT_ADMIN_USER
        if (!userId) {
            return
        }
        const discordUser = await this.bot.fetchUser(userId)
        if (!discordUser) {
            return
        }
        const user = new User(this.bot, userId)
        if (!user.roles) {
            user.roles = []
        }
        user.roles.push("admin")
        await user.save()
    }
}
