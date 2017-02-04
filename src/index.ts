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

import * as Discord from "discord.js"
import {Bot} from "./bot"
import {MemoryBrain, RedisBrain} from "./brain"
import * as Redis from "redis"
import {Website} from "./website"

const client = new Discord.Client()
const token = process.env["DISCORD_TOKEN"] as string
const debug = (process.env["NODE_ENV"] || "development") == "development"

if (!token) {
    console.log("DISCORD_TOKEN missing from environment.")
    process.exit(1)
}

const bot = new Bot(client)

const redisUrl = process.env["REDIS_URL"] as string
if (redisUrl) {
    const redisClient = Redis.createClient({url: redisUrl})
    redisClient.on("error", (err) => {
        log(err)
    })
    bot.brain = new RedisBrain(redisClient)
    log("Using redis brain, connecting to: " + redisUrl)
} else {
    bot.brain = new MemoryBrain()
    log("Using in-memory brain. NOTE: nothing will be persisted!")
}

client.login(token)

// Start the website
const website = new Website()
website.start()

function log(msg: string) {
    if (debug) {
        console.log(msg)
    }
}
