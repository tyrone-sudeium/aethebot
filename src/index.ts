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

import "./types"
import * as Discord from "discord.js"
import {Bot} from "./bot"
import {MemoryBrain, RedisBrain} from "./brain"
import * as Redis from "redis"
import {Website} from "./website"
import {log} from "./log"
import * as parseArgs from "minimist"

const argv = parseArgs(process.argv.slice(2))

let bot = null

if (!argv["website-only"]) {
    const token = process.env["DISCORD_TOKEN"] as string

    if (!token) {
        console.log("DISCORD_TOKEN missing from environment.")
        process.exit(1)
    }

    bot = new Bot(token)

    const redisUrl = process.env["REDIS_URL"] as string
    if (redisUrl) {
        const redisClient = Redis.createClient({url: redisUrl})
        redisClient.on("error", (err) => {
            log(err)
        })
        redisClient.on("connect", () => {
            log("redis connected")
        })
        redisClient.on("warning", (warn) => {
            log("redis warning: " + warn)
        })
        bot.brain = new RedisBrain(redisClient)
        log("Using redis brain, connecting to: " + redisUrl)
    } else {
        bot.brain = new MemoryBrain()
        log("Using in-memory brain. NOTE: nothing will be persisted!")
    }

    bot.login()
}

// Start the website
const website = new Website(bot)
website.start()
