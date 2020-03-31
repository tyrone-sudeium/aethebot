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

import { Bot } from "../../bot"
import { User } from "../../model/user"
import { GlobalFeature, MessageContext } from "../feature"

export type AdminAction = |
"ListServers" |
"Redis"

export async function canPerformAction(action: AdminAction, context: MessageContext<GlobalFeature>): Promise<boolean> {
    const user = new User(context.feature.bot, context.message.author.id)
    await user.load()
    if (!user.isAdmin) {
        context.sendNegativeReply("you are not an admin")
        return false
    }
    if (context.message.channel.type !== "dm") {
        context.sendNegativeReply("don't do admin commands in public you nong")
        return false
    }
    return true
}

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
        const tokens = this.commandTokens(context)
        if (tokens.length > 1 && tokens[1].toLowerCase() === "servers") {
            if (!(await canPerformAction("ListServers", context))) {
                return
            }
            const servers = this.bot.joinedServers()
                .map(guild => `${guild.name} (${guild.id})`)
                .join(", ")
            context.sendReply(servers)
            return
        }

        context.sendNegativeReply("unknown command")
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
