/**
 * Spits out how long since the last time the bot died or rebooted.
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
import * as Moment from "moment"
import "moment-precise-range-plugin"
import { Bot } from "../bot"
import { Feature } from "./feature"

export class UptimeFeature extends Feature {
    private startTime: number
    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.startTime = new Date().getTime()
    }

    public handleMessage(message: Discord.Message): boolean {
        const tokens = this.commandTokens(message)

        if (tokens.length < 1 ||
            tokens[0].toLowerCase() !== "uptime") {
            return false
        }
        const intervalStr = Moment(this.startTime).preciseDiff(Moment())
        const reply = `It's been like ${intervalStr} since I was last cooked`
        this.replyWith(message, reply)
        return true
    }

    public setStartTime(newTime: number) {
        this.startTime = newTime
    }
}
