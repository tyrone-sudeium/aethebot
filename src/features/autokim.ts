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

import * as Discord from "discord.js"
import { MessageContext, ServerFeature } from "./feature"

export class AutoKimFeature extends ServerFeature {
    public handlesMessage(context: MessageContext<this>): boolean {
        return false
    }

    public handleMessage(context: MessageContext<this>): boolean {
        return false
    }

    public onMessageReactionAdd(reaction: Discord.MessageReaction): boolean {
        if (!this.bot.user) {
            return false
        }
        // Auto-Kim any message that gets a Kim
        if (reaction.emoji.name === "happy" && reaction.me === false && !reaction.users.has(this.bot.user.id)) {
            reaction.message.react(reaction.emoji)
            return true
        }
        return false
    }
}
