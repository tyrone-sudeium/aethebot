/**
 * AetheBot is happy when you're happy.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 26/01/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { ServerFeature, DiscordReaction, DiscordUser } from "./feature"

export class AutoKimFeature extends ServerFeature {
    public handlesMessage(): boolean {
        return false
    }

    public handleMessage(): boolean {
        return false
    }

    public onMessageReactionAdd(reaction: DiscordReaction, user: DiscordUser): boolean {
        if (!this.bot.user) {
            return false
        }
        this.handleReaction(reaction, user)
        return true
    }

    private async handleReaction(reaction: DiscordReaction,
                                 user: DiscordUser): Promise<void> {
        if (!this.bot.user) {
            return
        }
        if (reaction.partial) {
            reaction = await reaction.fetch()
        }
        if (reaction.emoji.name === null) {
            // ?????????
            return
        }
        if (reaction.emoji.name !== "happy" && reaction.emoji.name.toLowerCase() !== "kekw") {
            // Don't fetch message partials for irrelevant emoji
            return
        }
        if (user.id === this.bot.user.id) {
            // Don't react to myself
            return
        }
        if (reaction.message.partial) {
            // Fetch the full message if our cache only has partial
            await reaction.message.fetch()
        }

        const channel = reaction.message.channel
        if (!channel.isDMBased() &&
            (!channel.permissionsFor(this.bot.user)?.has("AddReactions") ||
            !channel.permissionsFor(this.bot.user)?.has("UseExternalEmojis") ||
            !channel.permissionsFor(this.bot.user)?.has("ReadMessageHistory")))
        {
            return
        }

        const users = await reaction.users.fetch()
        // Auto-Kim any message that gets a Kim
        if (reaction.emoji.name === "happy" && !users.has(this.bot.user.id)) {
            reaction.message.react(reaction.emoji)
            return
        }
        // Auto-kekw any message that gets a kekw
        if (reaction.emoji.name.toLowerCase() === "kekw" && !users.has(this.bot.user.id)) {
            reaction.message.react(reaction.emoji)
        }
    }
}
