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
    handleMessage(message: Discord.Message): boolean {
        if (!message.isMentioned(this.bot.user)) {
            return false
        }
        let tokens = this.commandTokens(message)
        // If the only remaining token is "ping"
        if (tokens.length === 1 && /^ping[\!\?\.]*$/i.test(tokens[0])) {
            this.replyWith(message, "pong!")
        }
    }
}
