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
import { Bot } from "../../bot"
import { Feature } from "../feature"
import { pushReroll, Rerollable, RerollFeature } from "../reroll"
import { Dril } from "./dril"

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

export class PingFeature extends Feature implements Rerollable {
    private dril: Dril

    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.dril = new Dril(bot.brain)
    }

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
        } else if (joinedMessage === "drillme") {
            // ...th-that's lewd
            this.replyWith(message, this.dril.getNo())
            return true
        } else if (joinedMessage === "logoff") {
            // show yourself coward
            this.replyWith(message, this.dril.logoff())
            return true
        } else if (joinedMessage === "drilme") {
            // TODO: ^ if joinedMessage matches async responses
            this.respondAsync(message, joinedMessage)
            return true
        }

        return false
    }

    public async reroll(params: any, originalMessage: Discord.Message): Promise<string> {
        if (params === "drilme") {
            const tweet = await this.dril.getTweet(originalMessage.channel.id)
            return Promise.resolve(tweet)
        } else {
            throw new Error(`unknown parameter ${params} passed to PingFeature reroll`)
        }
    }

    private async respondAsync(message: Discord.Message, joinedMessage: string) {
        // If the message triggers dril content...
        if (joinedMessage === "drilme") {
            // it's good-ass dril content you seek
            const tweet = await this.dril.getTweet(message.channel.id)
            const uploadedMsg = await this.replyWith(message, tweet)
            pushReroll(this, uploadedMsg, message, "drilme", "delete")
            return
        }
    }
}
