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
import { GlobalFeature, MessageContext } from "./feature"

const BRAIN_KEYS = {
    LAST_DEPLOY: "dn:last_deploy",
    USERS: "dn:user_ids",
}

export class DeploymentNotificationsFeature extends GlobalFeature {
    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.sendNotifications()
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        if (tokens.length < 2) {
            return false
        }
        const command = `${tokens[0]} ${tokens[1]}`
        if (!(/^deploy(ment)?\snotifications?$/.test(command))) {
            return false
        }
        if (tokens.length > 3) {
            context.sendReply("??")
            return false
        }
        if (tokens.length > 2 &&
            (tokens[2].toLowerCase() !== "on" && tokens[2].toLowerCase() !== "off")) {
            context.sendReply("??")
            return false
        }
        // Totally valid message now. It WILL get handled eventually by the
        // async method.
        this.handleMessageAsync(context)
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

    private async handleMessageAsync(context: MessageContext<this>) {
        const tokens = this.commandTokens(context)
        const message = context.message
        const userIds = await this.getUserIds()
        if (tokens.length === 2) {
            // Fetch the status
            if (userIds.indexOf(context.message.author.id) === -1) {
                context.sendReply("yeah nah you're not getting 'em mate")
            } else {
                context.sendReply("yeah you'll get 'em mate")
            }
            return
        }

        const userIdsSet = new Set<string>(userIds)
        if (tokens[2].toLowerCase() === "on") {
            userIdsSet.add(message.author.id)
        }
        if (tokens[2].toLowerCase() === "off") {
            userIdsSet.delete(message.author.id)
        }
        await this.setUserIds(Array.from(userIdsSet))
        context.sendReply("ok")
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
