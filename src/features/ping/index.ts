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

import * as Discord from "discord.js"
import { Feature } from "../feature"
import { NEVER, NO, TOOTS } from "./dril"

const CAKKAW = "https://cdn.discordapp.com/attachments/310722644116897792/342599893963243521/cakkaw20.png"
const GREETINGS = [
    /^ping[\!\?\.]*$/i,
    /^hi[\!\?\.]*$/i,
    /^hello[\!\?\.]*$/i,
    /^g\'?day[\!\?\.]*$/i,
    /^(what\'?)s\s?up[\!\?\.]*$/i,
    /^yo[\!\?\.]*$/i,
]
const RESPONSES = [
    "g'day",
    "yeah mate",
    "oi",
    "pong, cunt",
]

let drilTweets: string[] = shuffle(TOOTS.slice(0))

function drilTweet() {

    if (drilTweets.length === 0) {
        drilTweets = shuffle(TOOTS.slice(0))
    }

    const tweet = drilTweets.pop()
    return tweet
}

function shuffle(a) {
    let j = 0
    let x = 0
    let i = 0

    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        x = a[i]
        a[i] = a[j]
        a[j] = x
    }

    return a
}

export class PingFeature extends Feature {
    public handleMessage(message: Discord.Message): boolean {
        const tokens = this.commandTokens(message)
        // If the only remaining token is "ping"
        if (tokens.length === 1) {
            if (GREETINGS.find( (rgx) => rgx.test(tokens[0]) )) {
                const idx = Math.floor(Math.random() * RESPONSES.length)
                this.replyWith(message, RESPONSES[idx])
                return true
            }
        }

        const joinedMessage = tokens.join("").toLowerCase()
        // If the message matches the shitheap of variants of "cakaw"
        if (joinedMessage.match(/[ck]a+w?c?k+a+w+/) != null) {
            this.replyWith(message, CAKKAW)
            return true
        }

        // If the message triggers dril content...
        if (joinedMessage === "drilme" || joinedMessage === ":dril:") {
            // it's good-ass dril content you seek
            this.replyWith(message, drilTweet())
            return true
        } else if (joinedMessage === "drillme") {
            // ...th-that's lewd
            this.replyWith(message, NO)
            return true
        } else if (joinedMessage === "logoff") {
            // show yourself coward
            this.replyWith(message, NEVER)
            return true
        }
        return false
    }
}
