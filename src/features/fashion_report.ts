/**
 * Finds and posts this week's fashion report solution (if any).
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 28/02/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { getJSON } from "../util/http"
import { GlobalFeature, MessageContext } from "./feature"

const weekOne = new Date("2018-01-30T08:00:00.000Z")
const query = "https://www.reddit.com/r/ffxiv/search.json?q=" +
    "title%3A%22Fashion+Report%22+AND+title%3A%22For+Week+Of%22&restrict_sr=1&t=month&sort=new"

type RedditObject = RedditListing | RedditT3

interface RedditListing {
    kind: "Listing"
    data: {
        children: RedditObject[]
    }
}

interface RedditT3 {
    kind: "t3"
    data: {
        title: string
        author: string
        url?: string
        domain?: string
        score?: number
        "created_utc": number
    }
}

function currentWeek(): number {
    return Math.ceil((new Date().getTime() - weekOne.getTime()) / 604800000)
}

function scorePost(post: RedditT3): number {
    let score = 0
    const titleLower = post.data.title.toLowerCase()
    const week = currentWeek()
    if (!post.data.url) {
        return 0
    }
    if (!post.data.domain) {
        return 0
    }
    if (titleLower.includes("full details")) {
        score = score + 1
    }
    if (titleLower.includes(`week ${week}`)) {
        score = score + 1
    }
    if (post.data.score && post.data.score > 20) {
        score = score + 1
    }
    if (post.data.author === "kaiyoko") {
        score = score + 1
    }
    if (post.data.domain === "i.imgur.com") {
        score = score + 1
    }
    const weekReset = weekOne.getTime() + (currentWeek() * 604800000)
    const fourDays = 86400000 * 4
    const expectedPostTimeSecs = (weekReset - fourDays) / 1000
    const weekResetSecs = weekReset / 1000
    if (post.data.created_utc < weekResetSecs && post.data.created_utc > expectedPostTimeSecs) {
        score = score + 1
    }
    return score
}

async function getRedditPosts(): Promise<RedditObject> {
    return getJSON(query)
}

async function handleFashionRequest(context: MessageContext<FashionReportFeature>): Promise<void> {
    const redditResp = await getRedditPosts()
    if (redditResp.kind !== "Listing") {
        context.sendNegativeReply("reddit seems cooked")
        return
    }
    const posts: RedditT3[] = redditResp.data.children.filter(p => p.kind === "t3") as RedditT3[]
    const sorted = posts.sort((a, b) => scorePost(b) - scorePost(a))
    if (sorted.length === 0) {
        context.sendReply("can't find anything for this week (yet?)")
        return
    }
    const topPost = sorted[0]
    const topPostScore = scorePost(topPost)
    if (topPostScore === 6) {
        context.sendReply(`Fashion Report for Week ${currentWeek()}: ${topPost.data.url}`)
        return
    }
    if (topPostScore >= 4) {
        context.sendReply(`Possible Fashion Report for Week ${currentWeek()}: ${topPost.data.url}`)
        return
    }
    context.sendReply("can't find anything for this week (yet?)")
    return
}

export class FashionReportFeature extends GlobalFeature {

    public handlesMessage(context: MessageContext<this>): boolean {
        if (!super.handlesMessage(context)) {
            return false
        }
        const tokens = this.commandTokens(context)
        if (tokens.length > 0 && tokens[0] === "fashion report") {
            return true
        }
        if (tokens.length > 0 && tokens[0] === "fr") {
            return true
        }
        if (tokens.length > 1 && tokens[0] === "fashion" && tokens[1] === "report") {
            return true
        }

        return false
    }

    public handleMessage(context: MessageContext<this>): boolean {
        handleFashionRequest(context)
        return true
    }
}
