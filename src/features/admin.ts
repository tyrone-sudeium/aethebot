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

import { Bot } from "../bot"
import { User } from "../model/user"
import { GlobalFeature, MessageContext } from "./feature"

export class AdminFeature extends GlobalFeature {
    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.setupDefaultAdminUser()
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        if (tokens.length < 1) {
            return false
        }
        if (tokens[0].toLowerCase() !== "admin") {
            return false
        }

        this.handleMessageAsync(context)
        return true
    }

    private async handleMessageAsync(context: MessageContext<this>): Promise<void> {
        const user = new User(this.bot, context.message.author.id)
        await user.load()
        if (!user.isAdmin) {
            context.sendNegativeReply("you are not an admin")
            return
        }
        if (context.message.channel.type !== "dm") {
            context.sendNegativeReply("don't do admin commands in public you nong")
            return
        }

        const tokens = this.commandTokens(context)
        if (tokens[1].toLowerCase() === "servers") {
            const servers = this.bot.joinedServers()
                .map(guild => `${guild.name} (${guild.id})`)
                .join(", ")
            context.sendReply(servers)
            return
        }

        context.sendReply("yeah?")
    }

    private async setupDefaultAdminUser(): Promise<void> {
        const userId = process.env.DEFAULT_ADMIN_USER
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
