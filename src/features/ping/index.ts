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
import { parseEmoji, removeEmoji } from "../../util/parse_emoji"
import { GlobalFeature, MessageContext } from "../feature"
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

interface DrilRerollParams {
    type: "drilme"
    count: number
}

function isDrilRerollParams(params: any): params is DrilRerollParams {
    return params.type === "drilme"
}

export class PingFeature extends GlobalFeature implements Rerollable {
    private dril: Dril

    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.dril = new Dril(bot.brain)
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        const message = context.message
        // If the only remaining token is "ping"
        if (tokens.length === 1) {
            if (GREETINGS.find( (rgx) => rgx.test(tokens[0]) )) {
                const idx = Math.floor(Math.random() * RESPONSES.length)
                context.sendReply(RESPONSES[idx])
                return true
            }
        }

        const joinedMessage = tokens.join("").toLowerCase()
        const emoji = parseEmoji(message)
        const isDrilEmoji = emoji.length === 1 && emoji[0].name === "dril"
        const messageWithoutEmoji = removeEmoji(joinedMessage)
        // If the message matches the shitheap of variants of "cakaw"
        if (joinedMessage.match(/[ck]a+w?c?k+a+w+/) != null) {
            context.sendReply(CAKKAW)
            return true
        } else if (joinedMessage === "drillme") {
            // ...th-that's lewd
            context.sendReply(this.dril.getNo())
            return true
        } else if (joinedMessage === "logoff") {
            // show yourself coward
            context.sendReply(this.dril.logoff())
            return true
        } else if (joinedMessage === "drilbomb" || (messageWithoutEmoji === "bomb" && isDrilEmoji)) {
            // Dril bomb
            this.drilAsync(context, {
                count: 5,
                type: "drilme",
            })
        } else if (joinedMessage === "drilme" || isDrilEmoji) {
            // TODO: ^ if joinedMessage matches async responses
            this.drilAsync(context, {
                count: 1,
                type: "drilme",
            })
            return true
        }

        return false
    }

    public async reroll(params: any, originalMessage: Discord.Message): Promise<string> {
        if (isDrilRerollParams(params)) {
            const tweets = await this.dril.getTweets(originalMessage.channel.id, params.count)
            return Promise.resolve(tweets.join("\n"))
        } else {
            throw new Error(`unknown parameter ${params} passed to PingFeature reroll`)
        }
    }

    private async drilAsync(context: MessageContext<this>, params: {type: string, count: number}) {
        // it's good-ass dril content you seek
        const tweets = await this.dril.getTweets(context.message.channel.id, params.count)
        const uploadedMsg = await context.sendReply(tweets.join("\n"))
        pushReroll(this, uploadedMsg, context.message, params, "delete")
        return
    }
}
