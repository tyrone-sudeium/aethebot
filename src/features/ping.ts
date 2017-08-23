/**
 * Responds to things with things
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
    handleMessage(message: Discord.Message): boolean {
        let tokens = this.commandTokens(message)
        // If the only remaining token is "ping"
        if (tokens.length === 1 && /^ping[\!\?\.]*$/i.test(tokens[0])) {
            this.replyWith(message, "pong!")
            return true
        }

        // If the message matches the shitheap of variants of "cakaw"
        const joinedMessage = tokens.join("")

        if (joinedMessage.match(/[ck]a+w?c?k+a+w+/) != null) {
            this.replyWith(message, "https://cdn.discordapp.com/attachments/310722644116897792/342599893963243521/cakkaw20.png")
            return true
        }
        return false
    }
}
