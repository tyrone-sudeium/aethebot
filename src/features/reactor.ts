/**
 * Automatically posts reactions to messages.
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
import { Feature } from "./feature"

export interface Reaction {
    reaction: string | Discord.Emoji | Discord.ReactionEmoji,
    regex: RegExp[],
}

export const REACTIONS: Reaction[] = [
    {
        reaction: "❌",
        regex: [/^(lmao|草)$/i],
    },
]

export class ReactorFeature extends Feature {
    public handlesMessage(message: Discord.Message): boolean {
        return true
    }

    public handleMessage(message: Discord.Message): boolean {
        const tokens = this.commandTokens(message)
        const reaction = this.reactionForMessage(tokens.join(" "))
        if (!reaction) {
            return false
        }
        message.react(reaction.reaction)
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

    protected reactionForMessage(message: string): Reaction | null {
        for (const reaction of REACTIONS) {
            if (reaction.regex.find((r) => r.test(message))) {
                return reaction
            }
        }
        return null
    }
}
