/**
 * Allows you to add twits to the global database.
 */

/*
* AetheBot - A Discord Chatbot
*
* Created by Tyrone Trevorrow on 09/02/22.
* Copyright (c) 2022 Tyrone Trevorrow. All rights reserved.
*
* This source code is licensed under the permissive MIT license.
*/

import { GlobalFeature, MessageContext } from "../feature"
import { wait } from "../../util/wait"
import { Brain } from "../../brain"
import { Dril } from "./dril"
import { TOOTS_BY_ID } from "./twits"
import { TweetPoolContent } from "./tweetpool"

export interface PersistedTwits {
    [id: string]: TweetPoolContent
}

export const BRAIN_KEY = "twit:custom_toots"

export async function fetchCustomToots(brain: Brain): Promise<PersistedTwits> {
    const persistedTwitsStr = await brain.get(BRAIN_KEY)
    let persistedTwits: PersistedTwits
    if (!persistedTwitsStr) {
        persistedTwits = {}
    } else {
        persistedTwits = JSON.parse(persistedTwitsStr)
    }
    return persistedTwits
}

export class TwitThisFeature extends GlobalFeature {
    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        if (tokens.length < 3) {
            return false
        }

        const command = tokens[0].toLowerCase()
        const action = tokens[1].toLowerCase()
        const acceptable = new Set(["this", "add", "new"])
        if (!(command === "twit" && acceptable.has(action))) {
            return false
        }

        const urlStr = tokens[2]
        let url: URL
        try {
            url = new URL(urlStr)
        } catch (exc) {
            context.sendNegativeReply("invalid url")
            return false
        }

        if (url.host !== "twitter.com") {
            context.sendNegativeReply("invalid url")
            return false
        }

        const pathComponents = url.pathname.split("/")
        if (pathComponents.length !== 4) {
            context.sendNegativeReply("invalid url")
            return false
        }
        if (pathComponents[2] !== "status") {
            context.sendNegativeReply("invalid url")
            return false
        }
        if (pathComponents[1] === "dril") {
            const dril = new Dril(this.bot.brain)
            const no = dril.getNo()
            const embed = dril.embedForContent(no)
            context.sendReply("", [embed])
            return true
        }

        this.addFromMessage(context, url)
        return false
    }

    private async addFromMessage(context: MessageContext<this>, url: URL): Promise<void> {
        const hourglassReact = await context.message.react("⏳")
        const pathComponents = url.pathname.split("/")
        const authorUsername = pathComponents[1]
        const tweetId = pathComponents[3]
        const canonicalUrl = `https://twitter.com/${authorUsername}/status/${tweetId}`

        const persistedTwits = await fetchCustomToots(this.bot.brain)

        if (persistedTwits[tweetId] || TOOTS_BY_ID.has(tweetId)) {
            context.sendNegativeReply("already added a tweet with that id")
            return
        }

        let attempts = 0
        while (attempts < 5) {
            if (context.message.embeds.length > 0) {
                break
            }
            await wait(1.0)
            attempts = attempts + 1
        }

        hourglassReact.remove()
        if (context.message.embeds.length === 0) {
            // gave up waiting for discord to embed
            context.sendNegativeReply("gave up waiting for discord to embed the tweet. try again later")
            return
        }

        const embed = context.message.embeds[0]
        if (!embed.author ||
            !embed.author.name ||
            !embed.author.proxyIconURL ||
            !embed.description)
        {
            context.sendNegativeReply("couldn't parse it. did discord change their shit?")
            return
        }

        const retweetsField = embed.fields.find(field => field.name === "Retweets")
        const likesField = embed.fields.find(field => field.name === "Likes")
        let retweets = 0
        let likes = 0
        if (retweetsField) {
            retweets = parseInt(retweetsField.value, 10)
        }
        if (likesField) {
            likes = parseInt(likesField.value, 10)
        }
        if (isNaN(retweets) || isNaN(likes)) {
            context.sendNegativeReply("couldn't parse it. did discord change their shit?")
            return
        }

        const description = embed.description.replace(/\*/g, "\\*")
        const content: TweetPoolContent = {
            avatar: embed.author.proxyIconURL,
            author: embed.author.name,
            content: description,
            url: canonicalUrl,
            likes,
            retweets,
        }
        if (embed.image && embed.image.proxyURL) {
            content.image = embed.image.proxyURL
        }

        persistedTwits[tweetId] = content
        const newJSON = JSON.stringify(persistedTwits)
        await this.bot.brain.set(BRAIN_KEY, newJSON)
        context.sendReply("ok")
    }
}
