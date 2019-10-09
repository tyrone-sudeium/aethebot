/**
 * The entrypoint.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as parseArgs from "minimist"
import * as Redis from "redis"
import { Bot } from "./bot"
import { Brain, MemoryBrain, RedisBrain } from "./brain"
import { allFeatures } from "./features"
import { log } from "./log"
import { Website } from "./website"

const argv = parseArgs(process.argv.slice(2))

let bot = null

const sharedMemoryBrain = new MemoryBrain()

function makeRedisClient(redisUrl: string): Redis.RedisClient {
    const redisClient = Redis.createClient({url: redisUrl})
    redisClient.on("error", (err: any) => {
        log(err)
    })
    redisClient.on("connect", () => {
        log("redis connected")
    })
    redisClient.on("warning", (warn: any) => {
        log("redis warning: " + warn)
    })
    return redisClient
}

if (!argv["website-only"]) {
    const token = process.env.DISCORD_TOKEN as string

    if (!token) {
        log("DISCORD_TOKEN missing from environment.")
        process.exit(1)
    }

    bot = new Bot(token)

    // Enable all features on the bot
    // If you're making your own bot you can manually import whichever features
    // you want and specify them individually instead.
    bot.features = allFeatures

    const redisUrl = process.env.REDIS_URL as string
    if (redisUrl) {
        const redisClient = makeRedisClient(redisUrl)
        bot.brain = new RedisBrain(redisClient)
        log("Bot using redis brain, connecting to: " + redisUrl)
    } else {
        bot.brain = sharedMemoryBrain
        log("Using in-memory brain. NOTE: nothing will be persisted!")
    }

    bot.login()
}

// Start the website
const baseURL = process.env.WEBSITE_BASE_URL as string | null
if (baseURL) {
    let brain: Brain
    if (!argv["website-only"] || !process.env.REDIS_URL) {
        brain = sharedMemoryBrain
    } else {
        const redisUrl = process.env.REDIS_URL as string
        if (!redisUrl) {
            log("fatal: invalid configuration: website-only mode requires REDIS_URL")
            process.exit(1)
        }
        const redisClient = makeRedisClient(redisUrl)
        brain = new RedisBrain(redisClient)
        log("Website using redis brain, connecting to: " + redisUrl)
    }
    const website = new Website(baseURL)
    website.brain = brain
    website.start()
} else {
    log("WEBSITE_BASE_URL not set, website will not run")
}
