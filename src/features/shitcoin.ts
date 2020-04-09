/**
 * Shows the price of a shit, made up, non-currency, internet monopoly money.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 06/02/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import * as Moment from "moment"
import { Bot } from "../bot"
import { log } from "../log"
import { getJSON } from "../util/http"
import { GlobalFeature, MessageContext } from "./feature"
import "moment-precise-range-plugin"

interface CoindeskAPIResponse<ResponseType> {
    data: ResponseType
    warnings: CoindeskAPIWarning[]
}

interface CoindeskAPIWarning {
    id: string
    message: string
    url: string
}

interface CoindeskPriceResponse {
    base: string
    currency: string
    amount: string
}

const UPDATE_FREQUENCY = 600000
const CURRENCY_CODE = "AUD"
const DOWN_IMG = "https://cdn.discordapp.com/attachments/293954139845820416/410699758282342401/unknown.png"
const UP_IMG = "https://cdn.discordapp.com/attachments/293954139845820416/410702466871721984/unknown.png"

const BRAIN_KEYS = {
    AGE: "sc:btc:age",
    CURRENT_PRICE: "sc:btc:current",
    PREVIOUS_PRICE: "sc:btc:previous",
}

const NUMBER_FORMATTER = new Intl.NumberFormat("au-AU", {
    style: "currency",
    currency: "AUD",
})

export class ShitcoinFeature extends GlobalFeature {
    private refreshTimer: NodeJS.Timer

    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.refreshTimer = this.startRefreshTimer()
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)

        if (tokens.length < 1 ||
            tokens[0].toLowerCase() !== "shitcoin") {
            return false
        }

        this.messageEmbed().then(embed => {
            if (!embed || !embed.fields) {
                return
            }
            if (embed.fields.length > 0) {
                context.message.channel.send("", {
                    embed,
                })
            }
        }).catch(log)

        return false
    }

    private async messageEmbed(): Promise<Discord.MessageEmbed> {
        const embed = new Discord.MessageEmbed()
        const previous = await this.previousPrice()
        const previousFormatted = NUMBER_FORMATTER.format(Number(previous))
        const current = await this.currentPrice()
        const currentFormatted = NUMBER_FORMATTER.format(Number(current))
        const ageStr = await this.bot.brain.get(BRAIN_KEYS.AGE)
        if (previous) {
            const btcPreviousDate = Moment().subtract(UPDATE_FREQUENCY, "milliseconds")
            embed.addField(btcPreviousDate.fromNow(), `${previousFormatted} / BTC`, true)
        }
        if (current) {
            embed.addField("Current", `${currentFormatted} / BTC`, true)
        }
        if (ageStr) {
            const btcPriceDate = Moment(parseInt(ageStr, 10))
            const intervalStr = btcPriceDate.fromNow()
            let prefix = ""
            if (previous && current) {
                if (parseInt(current, 10) > parseInt(previous, 10)) {
                    embed.setThumbnail(UP_IMG)
                    prefix = "📈"
                } else {
                    embed.setThumbnail(DOWN_IMG)
                    prefix = "📉"
                }
            }
            embed.setFooter(`${prefix}Last updated ${intervalStr}`)
        }
        return embed
    }

    private startRefreshTimer(): NodeJS.Timer {
        // Reload the price from Coinbase every 10 minutes
        return setInterval(() => {
            this.refreshPriceData()
        }, UPDATE_FREQUENCY)
    }

    private async currentPrice(): Promise<string | null> {
        const btcPrice = await this.bot.brain.get(BRAIN_KEYS.CURRENT_PRICE)
        if (btcPrice) {
            return btcPrice
        }
        await this.refreshPriceData()
        return await this.bot.brain.get(BRAIN_KEYS.CURRENT_PRICE)
    }

    private previousPrice(): Promise<string | null> {
        return this.bot.brain.get(BRAIN_KEYS.PREVIOUS_PRICE)
    }

    private async refreshPriceData(): Promise<void> {
        if (!(await this.isStoredPriceStale())) {
            return
        }
        const oldPrice = await this.bot.brain.get(BRAIN_KEYS.CURRENT_PRICE)
        const btcPriceData = await this.getPriceFromCoinbase(CURRENCY_CODE)
        await this.bot.brain.set(BRAIN_KEYS.CURRENT_PRICE, btcPriceData.data.amount)
        if (oldPrice) {
            await this.bot.brain.set(BRAIN_KEYS.PREVIOUS_PRICE, oldPrice)
        }
        await this.bot.brain.set(BRAIN_KEYS.AGE, `${new Date().getTime()}`)
    }

    private async isStoredPriceStale(): Promise<boolean> {
        const btcPriceAge = await this.bot.brain.get(BRAIN_KEYS.AGE)
        if (btcPriceAge) {
            const btcPriceDate = new Date(parseInt(btcPriceAge, 10))
            const currentDate = new Date()
            if (currentDate.getTime() - btcPriceDate.getTime() < UPDATE_FREQUENCY) {
                // Price is not stale. Do nothing
                return false
            }
        }
        return true
    }

    private getPriceFromCoinbase(currency: string): Promise<CoindeskAPIResponse<CoindeskPriceResponse>> {
        const url = `https://api.coinbase.com/v2/prices/spot?currency=${currency}`
        return getJSON(url)
    }
}
