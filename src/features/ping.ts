/**
 * Responds to mentioned "ping" with "pong"
 */

/*
 * AetheBot - A Discord Chatbot
 * 
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 * 
 * This source code is licensed under the permissive MIT license.
 */

import {Feature} from "./feature"
import * as Discord from "discord.js"

export class PingFeature extends Feature {
    botUser: Discord.User
    
    handleMessage(message: Discord.Message): boolean {
        if (!message.isMentioned(this.botUser)) {
            return false
        }
        let tokens = message.content.split(" ")
        // Remove the mention
        tokens.splice(tokens.findIndex((s) => s === `<@${this.botUser.id}>`), 1)

        // If the only remaining token is "ping"
        if (tokens.length === 1 && /^ping[\!\?\.]*$/i.test(tokens[0])) {
            message.channel.sendMessage(`<@${message.author.id}> pong!`)
        }
    }
}
