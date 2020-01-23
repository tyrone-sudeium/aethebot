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
import { log } from "../log"
import { GlobalFeature } from "./feature"

export class DebugFeature extends GlobalFeature {

    public handlesMessage(message: Discord.Message): boolean {
        // Debug logging handles every message.
        return true
    }

    public handleMessage(message: Discord.Message): boolean {
        // remove this when done debugging
        log("incoming message: " + message.content)
        return true
        // const debug = (process.env.NODE_ENV || "development") === "development"
        // // remove this when done debugging
        // if (!debug) {
        //     return false
        // } else {
        //     log("incoming message: " + message.content)
        //     return true
        // }
    }
}
