/**
 * Shitposts with the regional indicator emoji
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 26/01/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { GlobalFeature, MessageContext } from "./feature"

const EMOJIS = Array.from("🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿")

function emojiForCharacter(char: string): string | null {
    const index = char.toUpperCase().charCodeAt(0)
    if (index > 90 || index < 65) {
        return null
    }
    return EMOJIS[index - 65]
}

function stringIsAlphaOnly(str: string): boolean {
    return Array.from(str).reduce<boolean>((prev, curr) => {
        const code = curr.toUpperCase().charCodeAt(0)
        if (code !== 32 && (code < 65 || code > 90)) {
            return false
        }
        return prev
    }, true)
}

export class RegionalIndicatorFeature extends GlobalFeature {
    public handlesMessage(): boolean {
        return true
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        const message = context.message
        if (tokens.length < 3) {
            return false
        }
        const token0 = tokens[0].toUpperCase()
        const token1 = tokens[1].toUpperCase()
        if (token0 !== "REGIONAL" && token0 !== "REGION") {
            return false
        }
        if (token1 !== "INDICATOR:" && token1 !== "INDICATOR") {
            return false
        }
        const words = tokens.slice(2).join("")
        if (!stringIsAlphaOnly(words)) {
            context.sendReply("nah mate, alphabet characters only")
            return true
        }
        if (message.channel.type !== "dm" && words.length > 20) {
            context.sendReply("nah mate, way too long, i'm not your personal spambot")
            return true
        }

        const shitpost = tokens.slice(2).map( s => Array.from(s).map(emojiForCharacter).join(" ")).join("\n")
        message.channel.send(shitpost)
        return true
    }
}
