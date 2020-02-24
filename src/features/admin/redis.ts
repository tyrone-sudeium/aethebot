/**
 * A ghetto redis admin interface.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 24/02/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { RedisClient } from "redis"
import { Bot } from "../../bot"
import { MessageContext } from "../feature"
import { canPerformAction } from "./admin"
import { GlobalFeature } from ".."

export class RedisAdminFeature extends GlobalFeature {
    private redisClient: RedisClient

    public constructor(bot: Bot, name: string, client: RedisClient) {
        super(bot, name)
        this.redisClient = client
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        if (tokens.length < 1) {
            return false
        }
        if (tokens[0].toLowerCase() !== "redis") {
            return false
        }

        this.handleMessageAsync(context)
        return true
    }

    private async handleMessageAsync(context: MessageContext<this>): Promise<void> {
        const tokens = this.commandTokens(context)
        if (!(await canPerformAction("Redis", context))) {
            return
        }
        this.redisClient.exec(tokens.slice(1), (err, res) => {
            if (err) {
                context.sendNegativeReply(err.message)
                return
            }
            const tripleBacktick = "```"
            try {
                const jsonValue = JSON.parse(res)
                const pretty = JSON.stringify(jsonValue, null, 2)
                context.sendReply(`${tripleBacktick}\n${pretty}\n${tripleBacktick}`)
            } catch (jsonError) {
                context.sendReply(`${tripleBacktick}\n${res}\n${tripleBacktick}`)
            }
        })
    }
}
