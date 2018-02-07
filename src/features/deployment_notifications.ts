/**
 * Notifies people who've opted in when a bot deployment happens.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 07/02/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as ChildProcess from "child_process"
import * as Discord from "discord.js"
import { Bot } from "../bot"
import { Feature } from "./feature"

const BRAIN_KEYS = {
    LAST_DEPLOY: "dn:last_deploy",
    USERS: "dn:user_ids",
}

export class DeploymentNotificationsFeature extends Feature {
    public constructor(bot: Bot) {
        super(bot)
        this.sendNotifications()
    }

    public handleMessage(message: Discord.Message): boolean {
        const tokens = this.commandTokens(message)
        if (tokens.length < 2) {
            return false
        }
        const command = `${tokens[0]} ${tokens[1]}`
        if (!(/^deploy(ment)?\snotifications?$/.test(command))) {
            return false
        }
        if (tokens.length > 3) {
            this.replyWith(message, "??")
            return false
        }
        if (tokens[2].toLowerCase() !== "on" && tokens[2].toLowerCase() !== "off") {
            this.replyWith(message, "??")
            return false
        }
        // Totally valid message now. It WILL get handled eventually by the
        // async method.
        this.handleMessageAsync(message)
        return true
    }

    private async sourceVersion(): Promise<string> {
        let version = process.env.SOURCE_VERSION as string
        if (!version) {
            try {
                version = await this.gitRevision()
            } catch (err) {
                version = "unknown version"
            }
        }
        return version
    }

    private gitRevision(): Promise<string> {
        return new Promise((resolve, reject) => {
            ChildProcess.exec("git rev-parse HEAD", (err, stdout) => {
                if (err) {
                    reject(err)
                }
                resolve(stdout.trim())
            })
        })
    }

    private async sendNotifications(): Promise<void> {
        const lastDeploy = await this.bot.brain.get(BRAIN_KEYS.LAST_DEPLOY)
        const userIds = await this.getUserIds()
        const newVersion = await this.sourceVersion()
        if (lastDeploy === newVersion) {
            return // no-op if we've already notified about this version
        }
        for (const userId of userIds) {
            const user = await this.bot.fetchUser(userId)
            user.send(`New version deployed: ${newVersion}`)
        }

        // After all notifications go out, store this version in brain
        await this.bot.brain.set(BRAIN_KEYS.LAST_DEPLOY, newVersion)
    }

    private async handleMessageAsync(message: Discord.Message) {
        const tokens = this.commandTokens(message)
        const userIds = await this.getUserIds()
        if (tokens.length === 2) {
            // Fetch the status
            if (userIds.indexOf(message.author.id) === -1) {
                this.replyWith(message, "yeah nah you're not getting 'em mate")
            } else {
                this.replyWith(message, "yeah you'll get 'em mate")
            }
            return
        }

        const userIdsSet = new Set<string>()
        if (tokens[2].toLowerCase() === "on") {
            userIdsSet.add(message.author.id)
        }
        if (tokens[2].toLowerCase() === "off") {
            userIdsSet.delete(message.author.id)
        }
        await this.setUserIds(Array.from(userIdsSet))
        this.replyWith(message, "ok")
    }

    private async getUserIds(): Promise<string[]> {
        const storedJSON = await this.bot.brain.get(BRAIN_KEYS.USERS)
        if (!storedJSON) {
            return []
        }
        const array = JSON.parse(storedJSON)
        return array
    }

    private setUserIds(ids: string[]): Promise<void> {
        const json = JSON.stringify(ids)
        return this.bot.brain.set(BRAIN_KEYS.USERS, json)
    }
}
