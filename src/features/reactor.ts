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
import {Feature} from "./feature"

export interface Reaction {
    reaction: string | Discord.Emoji | Discord.ReactionEmoji,
    regex: RegExp[],
}

export const REACTIONS: Reaction[] = [
    {
        regex: [/^lmao$/i],
        reaction: "❌"
    }
]

export class ReactorFeature extends Feature {
    handlesMessage(message: Discord.Message): boolean {
        return true
    }

    handleMessage(message: Discord.Message): boolean {
        const tokens = this.commandTokens(message)
        const reaction = this._reactionForMessage(tokens.join(" "))
        if (!reaction) {
            return false
        }
        message.react(reaction.reaction)
        return false
    }

    private _reactionForMessage(message: string): Reaction {
        for (let reaction of REACTIONS) {
            if (reaction.regex.find(r => r.test(message))) {
                return reaction
            }
        }
        return null
    }
}
