/**
 * Tells the previously invoked (if supported) feature to retry.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 19/04/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import { log } from "../log"
import { FeatureBase, GlobalFeature, MessageContext } from "./feature"

export interface RerolledMessage {
    text: string
    embeds?: Discord.MessageEmbed[]
}

export interface Rerollable {
    reroll(params: any, originalMessage: Discord.Message): Promise<RerolledMessage>
}

type RerollType = "edit" | "delete"

interface RerollItem {
    channelId: Discord.Snowflake
    botMessageId: Discord.Snowflake
    humanMessageId: Discord.Snowflake
    timestamp: number
    featureName: string
    params: any
    type: RerollType
}

const BRAIN_KEYS = {
    LAST_ITEM: "rr:last_item",
}

const TRIGGERS = [
    "reroll",
    "retry",
    "again",
]

// Don't allow rerolls on messages more than five minutes old
const TIMEOUT = 300000

type RerollableFeature = FeatureBase & Rerollable

export class RerollFeature extends GlobalFeature {
    public handlesMessage(context: MessageContext<this>): boolean {
        if (!super.handlesMessage(context)) {
            return false
        }
        const tokens = this.commandTokens(context)
        // If the only remaining token is in the triggers
        if (tokens.length === 1 && TRIGGERS.includes(tokens[0].toLowerCase())) {
            return true
        }

        return false
    }

    public handleMessage(context: MessageContext<this>): boolean {
        this.doReroll(context)
        return true
    }

    public async pushRerollForFeature(
        featureName: string,
        botMessage: Discord.Message,
        humanMessage: Discord.Message,
        params: any,
        type: RerollType = "edit"): Promise<void> {
        const item: RerollItem = {
            botMessageId: botMessage.id,
            channelId: humanMessage.channel.id,
            featureName,
            humanMessageId: humanMessage.id,
            params,
            timestamp: new Date().getTime(),
            type,
        }
        const str = JSON.stringify(item)
        const key = this.brainKeyForChannel(humanMessage.channel.id)
        await this.bot.brain.set(key, str)
    }

    private brainKeyForChannel(chanId: Discord.Snowflake): string {
        return `${BRAIN_KEYS.LAST_ITEM}:${chanId}`
    }

    private async lastItemForChannel(chanId: Discord.Snowflake): Promise<RerollItem | null> {
        const key = this.brainKeyForChannel(chanId)
        try {
            const redisStr = await this.bot.brain.get(key)
            if (!redisStr) {
                return null
            }
            const item = JSON.parse(redisStr) as RerollItem
            return item
        } catch (err) {
            return null
        }
    }

    private async doReroll(context: MessageContext<this>): Promise<void> {
        const requestMsg = context.message
        const item = await this.lastItemForChannel(requestMsg.channel.id)
        if (!item) {
            context.sendNegativeReply()
            return
        }
        if (new Date().getTime() - item.timestamp > TIMEOUT) {
            await this.bot.brain.remove(this.brainKeyForChannel(requestMsg.channel.id))
            context.sendNegativeReply()
            return
        }
        try {
            const botMessage = await requestMsg.channel.messages.fetch(item.botMessageId)
            const humanMessage = await requestMsg.channel.messages.fetch(item.humanMessageId)
            const originalPoster = humanMessage.author
            if (!originalPoster || !requestMsg.author.equals(originalPoster)) {
                context.sendNegativeReply()
                return
            }
            const feature = this.bot.loadedFeatureForName(item.featureName)
            if (!botMessage || !feature) {
                context.sendNegativeReply()
                return
            }
            if ((feature as RerollableFeature).reroll) {
                const msgObj = await (feature as RerollableFeature).reroll(item.params, humanMessage)
                if (botMessage.channel.type !== "dm") {
                    msgObj.text = `<@${originalPoster.id}> ${msgObj.text}`
                }
                if (item.type === "edit") {
                    if (msgObj.embeds && msgObj.embeds.length === 1) {
                        await botMessage.edit(msgObj.text, msgObj.embeds[0])
                    } else {
                        await botMessage.edit(msgObj.text)
                    }
                } else if (item.type === "delete") {
                    await botMessage.delete()
                    const newMsg = await requestMsg.channel.send(msgObj.text, msgObj.embeds)
                    if (newMsg instanceof Discord.Message) {
                        await this.pushRerollForFeature(feature.name, newMsg, humanMessage, item.params, item.type)
                    }
                }
            } else {
                context.sendNegativeReply()
                return
            }
        } catch (err) {
            log(err)
        }
    }
}

// Pushes a reroll item with the specified parameters, if and only if the RerollFeature is
// loaded in the current bot.
export async function pushReroll(
    feature: FeatureBase,
    botMessage: Discord.Message | Discord.Message[],
    humanMessage: Discord.Message | Discord.Message[],
    params: any,
    type: RerollType = "edit"): Promise<void> {
    if (!(botMessage instanceof Discord.Message)) {
        return
    }
    if (!(humanMessage instanceof Discord.Message)) {
        return
    }
    const botUser = feature.bot.user
    if (!botUser) {
        return
    }
    const feat = feature.bot.loadedFeatureForName("RerollFeature")
    if (!feat) {
        return
    }
    if ((feat as RerollFeature).pushRerollForFeature) {
        const reroll = feat as RerollFeature
        return reroll.pushRerollForFeature(feature.name, botMessage, humanMessage, params, type)
    }
}
