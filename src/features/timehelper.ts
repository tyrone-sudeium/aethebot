/**
 * Looks for times in chat and helps with timezones.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Chrono from "chrono-node"
import * as Discord from "discord.js"
import Moment from "moment-timezone"
import { GlobalFeature, MessageContext } from "./feature"

const MAXIMUM_TIMEZONES = 4
Moment.locale("en")

export class TimehelperFeature extends GlobalFeature {

    public handleMessage(context: MessageContext<this>): boolean {
        // This is likely a command
        if (!this.handleCommand(context)) {
            // Command handler failed, treat it as an ambient
            this.handleAmbientMessage(context)
            return false
        }

        // Do nothing if not mentioned
        return false
    }

    public async handleAmbientMessage(context: MessageContext<this>): Promise<boolean> {
        // Remove the mentions
        const tokens = this.commandTokens(context)
        const mentionRegex = /\<\@\d+\>/g
        const noMentions = tokens.filter(token => !mentionRegex.test(token))
        const cleanMsg = noMentions.join(" ")
        const timezone = await this.timezoneForUser(context.message.author.id)
        if (!timezone || !Moment.tz.zone(timezone)) {
            return false
        }
        const zoneinfo = Moment.tz.zone(timezone)
        if (!zoneinfo) {
            return false
        }
        const zoneoffset = zoneinfo.offset(Number(new Date())) * -1
        const outZones = (await this.userTimezones()).map(z => z.toLowerCase())
        // Filter out the messager's timezone
        outZones.splice(outZones.indexOf(timezone.toLowerCase()), 1)
        if (outZones.length === 0) {
            // No timezones to translate to
            return false
        }
        const results = Chrono.parse(cleanMsg, { instant: new Date(), timezone: zoneoffset })
        if (!results || results.length === 0) {
            return false
        }
        const embed = new Discord.MessageEmbed()
        embed.setColor("#FF5200")
        for (const result of results) {
            if (!result.start.isCertain("hour")) {
                // If we're not given an hour, it's not precise enough to bother
                // everyone in the server.
                continue
            }
            const date = result.start.date()
            const unixTime = date.getTime() / 1000.0
            embed.addField(`"${result.text}"`, `<t:${unixTime.toFixed(0)}:F>`)
        }
        if (embed.fields && embed.fields.length > 0) {
            context.message.channel.send(embed)
        }
        return false
    }

    public handleCommand(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        if (tokens.length >= 1 &&
            tokens[0].toLowerCase() === "timezone") {
            if (tokens.length === 1) {
                // Just "timezone" on its own
                this.timezoneForUser(context.message.author.id).then(zone => {
                    context.sendReply("Your timezone is set to " + zone)
                })
                return true
            }
            const timezone = tokens[1]
            const removeKeywords = [
                "remove", "delete", "delet", "nil", "null", "none",
            ]
            if (removeKeywords.includes(timezone.toLowerCase())) {
                this.removeTimezoneForUser(context.message.author)
                context.sendReply("ok")
                return true
            }
            if (!Moment.tz.zone(timezone)) {
                context.sendReply("I don't recognise that timezone")
                return true
            }
            this.setTimezoneForUser(timezone, context.message.author.id)
            context.sendReply("ok")
            return true
        } else {
            return false
        }
    }

    protected timezoneForUser(userId: string): Promise<string | null> {
        const key = `th:tz:${userId}`
        return this.bot.brain.get(key)
    }

    protected setTimezoneForUser(timezone: string, userId: string): void {
        const key = `th:tz:${userId}`
        this.bot.brain.set(key, timezone)
        this.updateTimezonedUsers(userId, false)
    }

    protected removeTimezoneForUser(user: Discord.User): void {
        const key = `th:tz:${user.id}`
        this.bot.brain.remove(key)
        this.updateTimezonedUsers(user.id, true)
    }

    /** Async as fuck -- it could potentially take a really long time to
     * return. You better hope the brain is really fast.
     */
    protected async userTimezones(): Promise<string[]> {
        const key = "th:tzusers"
        const zones: string[] = []
        const userIdsStr = await this.bot.brain.get(key)
        if (!userIdsStr) {
            return zones
        }
        const userIds = userIdsStr.split(",").filter(x => !!x)
        for (const userId of userIds) {
            const zone = await this.timezoneForUser(userId)
            if (zone) {
                zones.push(zone)
            }
        }
        zones.slice(0, MAXIMUM_TIMEZONES)
        return zones
    }

    protected async updateTimezonedUsers(updatedUserId: string, removed: boolean): Promise<void> {
        const key = "th:tzusers"
        const userIdsStr = await this.bot.brain.get(key)
        if (!userIdsStr && !removed) {
            this.bot.brain.set(key, updatedUserId)
            return
        }
        if (!userIdsStr) {
            // Trying to remove a user from an empty list... how about we just bail
            return
        }
        const userIds = userIdsStr.split(",").filter(x => !!x)
        if (removed) {
            userIds.splice(userIds.indexOf(updatedUserId), 1)
            this.bot.brain.set(key, userIds.join(","))
        } else {
            if (userIds.includes(updatedUserId)) {
                return
            }
            userIds.push(updatedUserId)
            this.bot.brain.set(key, userIds.join(","))
        }
    }
}
