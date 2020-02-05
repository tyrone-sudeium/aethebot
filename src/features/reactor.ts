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
import { MessageContext, ServerFeature } from "./feature"

export interface Reaction {
    reaction: string | Discord.Emoji | Discord.ReactionEmoji
    regex: RegExp[]
}

export const REACTIONS: Reaction[] = [
    {
        reaction: "❌",
        regex: [/^(lmao|草)$/i],
    },
]

export class ReactorFeature extends ServerFeature {
    public handlesMessage(): boolean {
        return true
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        const reaction = this.reactionForMessage(tokens.join(" "))
        if (!reaction) {
            return false
        }
        context.message.react(reaction.reaction)
        return false
    }

    protected reactionForMessage(message: string): Reaction | null {
        for (const reaction of REACTIONS) {
            if (reaction.regex.find(r => r.test(message))) {
                return reaction
            }
        }
        return null
    }
}
