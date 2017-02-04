/**
 * Spits out incoming messages to the log in debug mode.
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
import {Feature} from "./feature"

export class DebugFeature extends Feature {
    handleMessage(message: Discord.Message): boolean {
        const debug = (process.env["NODE_ENV"] || "development") == "development"
        if (!debug) {
            return false
        } else {
            console.log("incoming message: " + message.content)
        }
    }
}
