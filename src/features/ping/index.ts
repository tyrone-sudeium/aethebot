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
import { GlobalFeature, MessageContext, SlashCommand } from "../feature"
import { pushReroll, Rerollable, RerolledMessage } from "../reroll"
import { Dril } from "./dril"
import { Twit } from "./twits"
import { TweetPoolContent, TweetPool } from "./tweetpool"

const CAKKAW = "https://tyrone-sudeium.github.io/aethebot-static/res/cakkaw20.png"
const REVOLVER = "https://tyrone-sudeium.github.io/aethebot-static/res/revolver2.gif"

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

// Maps the slash command name to the TwitterRerollParams.type type
const NAME_MAP = new Map<string, TwitterRerollParams["type"]>([["drilme", "drilme"], ["twitme", "twit"]])

export class PingFeature extends GlobalFeature implements Rerollable {
    public static slashCommands?: SlashCommand[] | undefined = [
        new Discord.SlashCommandBuilder()
            .setName("drilme")
            .setDescription("Pipe steaming hot @dril tweets directly from Hell into your squad chat")
            .addStringOption(option =>
                option.setName("prediction")
                    .setDescription("An optional prediction. Only LOSERS make predictions that match multiple tweets.")
                    .setRequired(false)
                    .setMaxLength(1000)
            )
        ,
        new Discord.SlashCommandBuilder()
            .setName("twitme")
            .setDescription("Fetch a random Good As Hell tweet from The Great Scrollback of Alexandria (and others)")
            .addStringOption(option =>
                option.setName("prediction")
                    .setDescription("An optional prediction. Good luck!")
                    .setRequired(false)
                    .setMaxLength(1000)
            )
        ,
    ]

    private dril: Dril
    private twit: Twit

    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.dril = new Dril(bot.brain)
        this.twit = new Twit(bot.brain)
    }

    public async handleInteraction(interaction: Discord.Interaction<Discord.CacheType>): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return
        }

        const params: TwitterRerollParams = {
            type: NAME_MAP.get(interaction.commandName) ?? "drilme",
            count: 1,
        }
        const toots = await this.getToots(interaction.channelId, params)
        const embeds = this.getEmbeds(params, toots)
        const prediction = interaction.options.getString("prediction")
        let text: string | undefined
        if (prediction) {
            text = `<@${interaction.user.id}>'s guess: ${prediction}`
        }
        const uploadedMsg = await interaction.reply({content: text, embeds, fetchReply: true})

        if (params.type === "drilme" && toots.length === 1 && this.dril.isNASA(toots[0].url)) {
            const emojis = this.autoAirhornEmojis(interaction.guild)
            if (emojis !== null) {
                await uploadedMsg.react(emojis.airhorn)
                await uploadedMsg.react(emojis.nasa)
            }
        }

        if (params.type === "drilme") {
            const remaining = await this.dril.getRemaining(interaction.channelId)
            if (remaining === 0) {
                await interaction.followUp({content: REVOLVER})
            }
        }
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
        const emoji = parseEmoji(message.content)
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
            context.sendReply("", [embed])
            return true
        } else if (joinedMessage === "logoff") {
            // show yourself coward
            const embed = this.dril.embedForContent(this.dril.logoff())
            context.sendReply("", [embed])
            return true
        } else if (joinedMessage === "geans") {
            // denam geans
            context.sendReply(this.dril.getGeans())
            return true
        } else if (joinedMessage === "coronavirus" || joinedMessage === "covid" || joinedMessage === "beervirus") {
            // flatten the curve
            const embed = this.dril.embedForContent(this.dril.getBeerVirus())
            context.sendReply("", [embed])
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
            context.sendReply("i can't be fucked keeping track any more, fuck it. google it")
            return true
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
            const toots = await this.getToots(originalMessage.channel.id, params)
            const embeds = this.getEmbeds(params, toots)
            return Promise.resolve({text: "",  embeds})
        } else {
            throw new Error(`unknown parameter ${params} passed to PingFeature reroll`)
        }
    }

    private getEmbeds(params: TwitterRerollParams,
                      toots: TweetPoolContent[]): Discord.EmbedBuilder[] {
        let source: TweetPool
        if (params.type === "nasa" || params.type === "drilme") {
            source = this.dril
        } else {
            source = this.twit
        }
        return toots.map(t => source.embedForContent(t))
    }

    private async getToots(channelId: string, params: TwitterRerollParams): Promise<TweetPoolContent[]> {
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
        return tweets
    }

    private async tweetAsync(context: MessageContext<this>,
                             params: TwitterRerollParams): Promise<void> {
        const toots = await this.getToots(context.message.channel.id, params)
        const embeds = this.getEmbeds(params, toots)
        const uploadedMsg = await context.sendReply("", [embeds[0]])
        if (params.type === "drilme" && toots.length === 1 && this.dril.isNASA(toots[0].url)) {
            const emojis = this.autoAirhornEmojis(context.message.guild)
            if (emojis !== null) {
                await uploadedMsg.react(emojis.airhorn)
                await uploadedMsg.react(emojis.nasa)
            }
        }

        if (params.type === "drilme") {
            const remaining = await this.dril.getRemaining(context.message.channel.id)
            if (remaining === 0) {
                await context.sendPlain(REVOLVER)
            }
        }
        pushReroll(this, uploadedMsg, context.message, params, "delete")
        return
    }

    private autoAirhornEmojis(guild: Discord.Guild | null): AutoAirhornEmojis | null {
        if (guild === null) {
            return null
        }
        const airhorn = guild.emojis.cache.find(e => e.name === "airhorn")
        const nasa = guild.emojis.cache.find(e => e.name === "nasa")
        if (airhorn && nasa) {
            return { airhorn, nasa }
        }
        return null
    }
}

interface AutoAirhornEmojis {
    airhorn: Discord.GuildEmoji
    nasa: Discord.GuildEmoji
}
