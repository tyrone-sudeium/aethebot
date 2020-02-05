/**
 * Remove Discord Mentions from a message and returns the string.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 08/06/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import { Bot } from "../bot"

export function removeBotMentions(bot: Bot, message: Discord.Message): string {
    if (!bot.user) {
        return message.content
    }
    return message.content.replace(new RegExp(`<@\!?${bot.user.id}>`, "g"), "")
}
