/**
 * Parses Custom Emoji references out of a Discord Message.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 02/05/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"

export interface MessageEmoji {
    id: Discord.Snowflake
    name: string
}

export function parseEmoji(msg: Discord.Message): MessageEmoji[] {
    const regex = /<:([^\s]+):(\d+)>/g
    const emojis: MessageEmoji[] = []
    let match = regex.exec(msg.content)
    while (match) {
        if (match.length >= 3) {
            emojis.push({
                id: match[2],
                name: match[1],
            })
        }
        match = regex.exec(msg.content)
    }
    return emojis
}
