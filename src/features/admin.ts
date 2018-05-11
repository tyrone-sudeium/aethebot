/**
 * A ghetto admin interface.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 11/05/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import { Bot } from "../bot"
import { User } from "../model/user"
import { Feature } from "./feature"

export class AdminFeature extends Feature {
    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.setupDefaultAdminUser()
    }

    public handleMessage(message: Discord.Message): boolean {
        const tokens = this.commandTokens(message)
        if (tokens.length < 1) {
            return false
        }
        if (tokens[0].toLowerCase() !== "admin") {
            return false
        }

        this.handleMessageAsync(message)
        return true
    }

    private async handleMessageAsync(message: Discord.Message) {
        const user = new User(this.bot, message.author.id)
        await user.load()
        if (!user.isAdmin) {
            this.replyNegatively(message, "you are not an admin")
            return
        }
        if (message.channel.type !== "dm") {
            this.replyNegatively(message, "don't do admin commands in public you nong")
            return
        }

        this.replyWith(message, "yeah?")
    }

    private async setupDefaultAdminUser(): Promise<void> {
        const userId = process.env.DEFAULT_ADMIN_USER as string | undefined
        if (!userId) {
            return
        }
        const discordUser = await this.bot.fetchUser(userId)
        if (!discordUser) {
            return
        }
        const user = new User(this.bot, userId)
        if (!user.roles) {
            user.roles = []
        }
        user.roles.push("admin")
        await user.save()
    }
}
