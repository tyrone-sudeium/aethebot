/**
 * Abstract robot capability.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import randomNumber from "random-number-csprng"
import { Bot } from "../bot"

const NEGATIVES = [
    "yeah, nah",
    "no",
    "nah that's fucked as",
    "can't do it mate",
    "nope, ya fucked it",
    "what even is that m8",
    "do it properly cunt",
    "nah fuck ya",
]

function reply(channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
               mention: Discord.User,
               replyStr: string,
               embed?: Discord.MessageEmbed): Promise<Discord.Message> {
    if (channel.type === "dm") {
        if (embed) {
            return channel.send(replyStr, embed)
        } else {
            return channel.send(replyStr)
        }
    } else {
        const spacer = replyStr.length > 0 ? " " : ""
        if (embed) {
            return channel.send(`<@${mention.id}>${spacer}${replyStr}`, embed)
        } else {
            return channel.send(`<@${mention.id}>${spacer}${replyStr}`)
        }
    }
}

export class MessageContext<F extends FeatureBase> {
    private myMessage: Discord.Message
    private myFeature: F
    public constructor(message: Discord.Message, feature: F) {
        this.myFeature = feature
        this.myMessage = message
    }

    public get message(): Discord.Message {
        return this.myMessage
    }

    public get feature(): F {
        return this.myFeature
    }

    public async sendReply(str: string, embed?: Discord.MessageEmbed): Promise<Discord.Message> {
        return reply(this.message.channel, this.message.author, str, embed)
    }

    /**
     * Send a random rejection message, intended as a result of a (usually) intentional misuse or bad parameter,
     * like sending a large or negative number.
     */
    public async sendNegativeReply(hint?: string): Promise<Discord.Message | Discord.Message[]> {
        const idx = await randomNumber(0, NEGATIVES.length - 1)
        const msg = NEGATIVES[idx]
        if (hint) {
            return this.sendReply(`${msg} (${hint})`)
        } else {
            return this.sendReply(msg)
        }
    }
}

export interface FeatureBase {
    onMessageReactionAdd?(reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): boolean
    onMessageReactionRemove?(reaction: Discord.MessageReaction, user: Discord.User | Discord.PartialUser): boolean
}

export abstract class FeatureBase {

    public get bot(): Bot {
        return this.internalBot
    }

    public name: string
    private internalBot: Bot

    public constructor(bot: Bot, name: string) {
        this.internalBot = bot
        this.name = name
    }

    public voiceChannelStateChanged?(channel: Discord.VoiceChannel): void

    public handlesMessage(context: MessageContext<this>): boolean {
        const message = context.message
        if (!this.bot.user) {
            return false
        }
        // Ignore messages sent by the bot itself
        if (message.author.equals(this.bot.user)) {
            return false
        }
        // Handle all DMs by default
        if (message.channel.type === "dm") {
            return true
        }
        // Handle messages where the bot is specifically mentioned
        if (message.mentions.has(this.bot.user, {
            ignoreEveryone: true,
            ignoreRoles: true,
        })) {
            return true
        }
        return false
    }

    public commandTokens(context: MessageContext<this>): string[] {
        const message = context.message
        const matches = message.content.trim().match(/\\?.|\n|^$/g)
        if (!matches) {
            return []
        }
        const tokens = matches.reduce((state, c) => {
            if (c === '"') {
                state.quote = !state.quote
            } else if (!state.quote && c === " ") {
                state.a.push("")
            } else if (!state.quote && c === "\n") {
                state.a.push(c)
                state.a.push("")
            } else {
                state.a[state.a.length-1] += c.replace(/\\(.)/,"$1")
            }
            return state
        }, {
            a: [""],
            quote: false,
        })
            .a
            .filter(token => token !== "")

        const user = this.bot.user
        // Remove the mention
        if (user && message.mentions.has(user)) {
            tokens.splice(tokens.findIndex(s => {
                if (s === `<@${user.id}>`) {
                    return true
                }
                if (s === `<@!${user.id}>`) {
                    return true
                }
                return false
            }), 1)
        }
        return tokens
    }

    public abstract handleMessage(context: MessageContext<this>): boolean
}

/**
 * GlobalFeature is a feature which is intantiated once per-bot, and will be
 * present in every server the bot is joined to.
 */
export abstract class GlobalFeature extends FeatureBase {

}

/**
 * ServerFeature is a feature which is instantiated per-server, and must be
 * added to a server to work.
 */
export abstract class ServerFeature extends FeatureBase {
    private internalServer: Discord.Guild

    public constructor(bot: Bot, name: string, server: Discord.Guild) {
        super(bot, name)
        this.internalServer = server
    }

    public get server(): Discord.Guild {
        return this.internalServer
    }
}
