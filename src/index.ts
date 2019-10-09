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

if (!argv.website) {
    const token = process.env.DISCORD_TOKEN as string

    if (!token) {
        log("DISCORD_TOKEN missing from environment.")
        process.exit(1)
    }

    let brain: Brain

    const redisUrl = process.env.REDIS_URL as string
    if (redisUrl) {
        const redisClient = makeRedisClient(redisUrl)
        const pubsubClient = makeRedisClient(redisUrl)
        brain = new RedisBrain(redisClient, pubsubClient)
        log("Bot using redis brain, connecting to: " + redisUrl)
    } else {
        brain = sharedMemoryBrain
        log("Using in-memory brain. NOTE: nothing will be persisted!")
    }

    bot = new Bot(token, brain)
    // Enable all features on the bot
    // If you're making your own bot you can manually import whichever features
    // you want and specify them individually instead.
    bot.features = allFeatures

    bot.login()
}

// Start the website
const baseURL = process.env.WEBSITE_BASE_URL as string | null
if (!argv.bot && baseURL) {
    let brain: Brain
    if (!argv.website || !process.env.REDIS_URL) {
        brain = sharedMemoryBrain
    } else {
        const redisUrl = process.env.REDIS_URL as string
        if (!redisUrl) {
            log("fatal: invalid configuration: website-only mode requires REDIS_URL")
            process.exit(1)
        }
        const redisClient = makeRedisClient(redisUrl)
        const pubsubClient = makeRedisClient(redisUrl)
        brain = new RedisBrain(redisClient, pubsubClient)
        log("Website using redis brain, connecting to: " + redisUrl)
    }
    const website = new Website(baseURL)
    website.brain = brain
    website.start()
    if (argv.website) {
        log("running in website-only mode")
    }
} else {
    if (argv.website) {
        log("fatal: invalid configuration: website-only mode requires WEBSITE_BASE_URL")
        process.exit(1)
    } else {
        log("running in bot-only mode")
    }
}
