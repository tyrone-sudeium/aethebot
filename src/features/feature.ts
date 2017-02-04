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
import {Bot} from "../bot"

export abstract class Feature {
    bot: Bot

    constructor(bot: Bot) {
        this.bot = bot
    }
    
    abstract handleMessage(message: Discord.Message): boolean

    commandTokens(message: Discord.Message): string[] {
        let tokens = message.content.split(" ")
        // Remove the mention
        tokens.splice(tokens.findIndex((s) => s === `<@${this.bot.user.id}>`), 1)
        return tokens
    }

    replyWith(message: Discord.Message, replyStr: string): Promise<Discord.Message> {
        const chan = message.channel
        return chan.sendMessage(`<@${message.author.id}> ${replyStr}`)
    }
}
