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
import * as randomNumber from "random-number-csprng"
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

export interface FeatureBase {
    onMessageReactionAdd?(reaction: Discord.MessageReaction): boolean
}

export abstract class FeatureBase {

    public get bot(): Bot {
        return this.internalBot
    }

    public name: string
    protected negatives = NEGATIVES
    private internalBot: Bot

    constructor(bot: Bot, name: string) {
        this.internalBot = bot
        this.negatives = NEGATIVES
        this.name = name
    }

    public abstract handleMessage(message: Discord.Message): boolean

    public voiceChannelStateChanged?(channel: Discord.VoiceChannel): void

    public handlesMessage(message: Discord.Message): boolean {
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
        if (message.isMentioned(this.bot.user)) {
            return true
        }
        return false
    }

    public commandTokens(message: Discord.Message): string[] {
        const tokens = message.content.trim().split(/\s+/)
        const user = this.bot.user
        // Remove the mention
        if (user && message.isMentioned(user)) {
            tokens.splice(tokens.findIndex((s) => {
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

    public replyWith(message: Discord.Message, replyStr: string): Promise<Discord.Message | Discord.Message[]> {
        const chan = message.channel
        return this.reply(chan, message.author, replyStr)
    }

    public reply(channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel,
                 mention: Discord.User,
                 replyStr: string): Promise<Discord.Message | Discord.Message[]> {
        if (channel.type === "dm") {
            return channel.send(replyStr)
        } else {
            return channel.send(`<@${mention.id}> ${replyStr}`)
        }
    }

    // Send a random rejection message, intended as a result of a (usually) intentional misuse or bad parameter,
    // like sending a large or negative number.
    public async replyNegatively(message: Discord.Message,
                                 hint: string | null = null): Promise<Discord.Message | Discord.Message[]> {
        const idx = await randomNumber(0, this.negatives.length - 1)
        const msg = this.negatives[idx]
        if (hint) {
            return this.replyWith(message, `${msg} (${hint})`)
        } else {
            return this.replyWith(message, msg)
        }
    }
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

    constructor(bot: Bot, name: string, server: Discord.Guild) {
        super(bot, name)
        this.internalServer = server
    }

    public get server(): Discord.Guild {
        return this.internalServer
    }
}
