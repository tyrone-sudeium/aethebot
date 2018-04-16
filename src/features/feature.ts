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

export abstract class Feature {
    public bot: Bot
    private negatives = NEGATIVES

    constructor(bot: Bot) {
        this.bot = bot
    }

    public abstract handleMessage(message: Discord.Message): boolean

    public handlesMessage(message: Discord.Message): boolean {
        // Ignore messages send by the bot itself
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

        // Remove the mention
        if (message.isMentioned(this.bot.user)) {
            tokens.splice(tokens.findIndex((s) => {
                if (s === `<@${this.bot.user.id}>`) {
                    return true
                }
                if (s === `<@!${this.bot.user.id}>`) {
                    return true
                }
                return false
            }), 1)
        }
        return tokens
    }

    public replyWith(message: Discord.Message, replyStr: string): Promise<Discord.Message | Discord.Message[]> {
        const chan = message.channel
        if (message.channel.type === "dm") {
            return chan.sendMessage(replyStr)
        } else {
            return chan.sendMessage(`<@${message.author.id}> ${replyStr}`)
        }
    }

    // Send a random rejection message, intended as a result of a (usually) intentional misuse or bad parameter,
    // like sending a large or negative number.
    public async replyNegatively(message: Discord.Message): Promise<Discord.Message | Discord.Message[]> {
        const idx = await randomNumber(0, this.negatives.length)
        const msg = this.negatives[idx]
        return this.replyWith(message, msg)
    }
}
