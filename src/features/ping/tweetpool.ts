/**
 * Base class for Twitter content getters.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 05/08/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import { Brain } from "../../brain"
import { shuffle } from "../../util/shuffle"

const TWITTER_ICON = "https://cdn.discordapp.com/attachments/293954139845820416/697810035769606206/twitter-footer.png"

export interface TweetListPersistence {
    v: number
    toots: string[]
}

export interface TweetPoolContent {
    content: string
    retweets: number
    likes: number
    url: string
    author: string
    avatar: string
    image?: string
}

export abstract class TweetPool {
    protected abstract get persistenceVersion(): number
    public constructor(
        public brain: Brain
    ) { }

    /**
     * Returns the number of posts remaining in the pool, WITHOUT reshuffling if it's zero.
     * @param channelId Discord channel ID scope
     */
    public async getRemaining(channelId: string): Promise<number> {
        try {
            const tootsJSONStr = await this.brain.get(this.brainKeyForChannel(channelId))
            if (tootsJSONStr) {
                const json: TweetListPersistence = JSON.parse(tootsJSONStr)
                if (!json.v || json.v !== this.persistenceVersion) {
                    return 0
                } else {
                    return json.toots.length
                }
            } else {
                return 0
            }
        } catch (err) {
            return 0
        }
    }

    public async getTweets(channelId: string, count: number): Promise<TweetPoolContent[]> {
        let toots: string[] = []
        const selected: TweetPoolContent[] = []
        const list = await this.fetchList()
        try {
            const tootsJSONStr = await this.brain.get(this.brainKeyForChannel(channelId))
            if (tootsJSONStr) {
                const json = JSON.parse(tootsJSONStr)
                if (!json.v || json.v !== this.persistenceVersion) {
                    toots = shuffle(Array.from(list.keys()))
                } else {
                    toots = json.toots
                }
            } else {
                toots = shuffle(Array.from(list.keys()))
            }
        } catch (err) {
            toots = shuffle(Array.from(list.keys()))
        }
        while (selected.length < count) {
            if (toots.length === 0) {
                toots = shuffle(Array.from(list.keys()))
            }

            const tweetId = toots.pop() || ""
            const toot = list.get(tweetId)
            if (toot) {
                selected.push(toot)
            }
        }
        const newPersistedData: TweetListPersistence = {
            toots,
            v: this.persistenceVersion,
        }
        await this.brain.set(this.brainKeyForChannel(channelId), JSON.stringify(newPersistedData))
        return selected
    }

    public embedForContent(toot: TweetPoolContent): Discord.EmbedBuilder {
        const embed = new Discord.EmbedBuilder()
        embed.setAuthor({name: toot.author, iconURL: toot.avatar, url: toot.url})
        embed.setDescription(toot.content)
        embed.setFooter({text: "Twitter", iconURL: TWITTER_ICON})
        embed.setColor([29, 161, 242])
        embed.addFields(
            {
                name: "Retweets",
                value: `${toot.retweets}`,
                inline: true,
            },
            {
                name: "Likes",
                value: `${toot.likes}`,
                inline: true,
            },
        )

        if (toot.image) {
            embed.setImage(toot.image)
        }
        return embed
    }

    protected abstract brainKeyForChannel(channelId: string): string
    protected abstract fetchList(): Promise<Map<string, TweetPoolContent>>
}
