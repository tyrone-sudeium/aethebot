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
import { pushReroll, Rerollable, RerolledMessage } from "../reroll"
import { Dril } from "./dril"
import { Twit } from "./twits"
import { TweetPoolContent, TweetPool } from "./tweetpool"

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

interface TwitterRerollParams {
    type: "drilme" | "nasa" | "twit"
    count: number
}

function isDrilRerollParams(params: any): params is TwitterRerollParams {
    return params.type === "drilme" || params.type === "nasa" || params.type === "twit"
}

export class PingFeature extends GlobalFeature implements Rerollable {
    private dril: Dril
    private twit: Twit

    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.dril = new Dril(bot.brain)
        this.twit = new Twit(bot.brain)
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        const message = context.message
        // If the only remaining token is "ping"
        if (tokens.length === 1) {
            if (GREETINGS.find( rgx => rgx.test(tokens[0]) )) {
                const idx = Math.floor(Math.random() * RESPONSES.length)
                context.sendReply(RESPONSES[idx])
                return true
            }
        }

        const joinedMessage = tokens.join("").toLowerCase()
        const emoji = parseEmoji(message)
        const isDrilEmoji = emoji.length === 1 && emoji[0].name === "dril"
        const isNasaEmoji = emoji.length === 1 && emoji[0].name === "nasa"
        const messageWithoutEmoji = removeEmoji(joinedMessage)
        // If the message matches the shitheap of variants of "cakaw"
        if (/[ck]a+w?c?k+a+w+/.exec(joinedMessage) != null) {
            context.sendReply(CAKKAW)
            return true
        } else if (joinedMessage === "drillme") {
            // ...th-that's lewd
            const embed = this.dril.embedForContent(this.dril.getNo())
            context.sendReply("", embed)
            return true
        } else if (joinedMessage === "logoff") {
            // show yourself coward
            const embed = this.dril.embedForContent(this.dril.logoff())
            context.sendReply("", embed)
            return true
        } else if (joinedMessage === "geans") {
            // denam geans
            context.sendReply(this.dril.getGeans())
            return true
        } else if (joinedMessage === "coronavirus" || joinedMessage === "covid" || joinedMessage === "beervirus") {
            // flatten the curve
            const embed = this.dril.embedForContent(this.dril.getBeerVirus())
            context.sendReply("", embed)
        } else if (joinedMessage === "drilbomb" || (messageWithoutEmoji === "bomb" && isDrilEmoji)) {
            // Dril bomb. RIP dril bomb -- a casualty of embed limitations
            // Seems like discord.js and/or the Discord API cannot handle multiple embeds per message
            // Even though the Discord clients do support this
            this.tweetAsync(context, {
                count: 1,
                type: "drilme",
            })
        } else if (joinedMessage === "drilme" || isDrilEmoji) {
            // TODO: ^ if joinedMessage matches async responses
            this.tweetAsync(context, {
                count: 1,
                type: "drilme",
            })
            return true
        } else if (joinedMessage === "nasa" || isNasaEmoji) {
            this.tweetAsync(context, {
                count: 1,
                type: "nasa",
            })
            return true
        } else if (/((canwegetonthe)|(getonthe))beers\??/.exec(joinedMessage) != null) {
            context.sendReply("no")
        } else if (joinedMessage === "twitme") {
            this.tweetAsync(context, {
                count: 1,
                type: "twit",
            })
        }

        return false
    }

    public async reroll(params: any, originalMessage: Discord.Message): Promise<RerolledMessage> {
        if (isDrilRerollParams(params)) {
            const embeds = await this.getEmbeds(originalMessage.channel.id, params)
            return Promise.resolve({text: "",  embeds})
        } else {
            throw new Error(`unknown parameter ${params} passed to PingFeature reroll`)
        }
    }

    private async getEmbeds(channelId: string, params: TwitterRerollParams): Promise<Discord.MessageEmbed[]> {
        // it's good-ass dril content you seek
        let tweets: TweetPoolContent[] = []
        let source: TweetPool
        if (params.type === "nasa") {
            tweets = [await this.dril.getNASA()]
            source = this.dril
        } else {
            if (params.type === "drilme") {
                source = this.dril
            } else {
                source = this.twit
            }
            tweets = await source.getTweets(channelId, params.count)
        }
        const embeds = tweets.map(t => source.embedForContent(t))
        return embeds
    }

    private async tweetAsync(context: MessageContext<this>, params: TwitterRerollParams): Promise<void> {
        const embeds = await this.getEmbeds(context.message.channel.id, params)
        const uploadedMsg = await context.sendReply("", embeds[0])
        pushReroll(this, uploadedMsg, context.message, params, "delete")
        return
    }
}
