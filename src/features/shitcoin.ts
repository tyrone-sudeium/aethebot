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
import * as HTTP from "http"
import * as HTTPS from "https"
import * as Moment from "moment"
import "moment-precise-range-plugin"
import { Bot } from "../bot"
import { log } from "../log"
import { Feature } from "./feature"

// Fix the shit type definitions for node
declare module "https" {
    export function get(options: string, callback?: (res: HTTP.IncomingMessage) => void): HTTP.ClientRequest
}

interface CoindeskAPIResponse<ResponseType> {
    data: ResponseType,
    warnings: CoindeskAPIWarning[]
}

interface CoindeskAPIWarning {
    id: string,
    message: string,
    url: string
}

interface CoindeskPriceResponse {
    base: string,
    currency: string,
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

export class ShitcoinFeature extends Feature {
    private refreshTimer: NodeJS.Timer

    constructor(bot: Bot, name: string) {
        super(bot, name)
        this.refreshTimer = this.startRefreshTimer()
    }

    public handleMessage(message: Discord.Message): boolean {
        const tokens = this.commandTokens(message)

        if (tokens.length < 1 ||
            tokens[0].toLowerCase() !== "shitcoin") {
            return false
        }

        this.messageEmbed().then((embed) => {
            if (!embed || !embed.fields) {
                return
            }
            if (embed.fields.length > 0) {
                message.channel.send("", {
                    embed,
                })
            }
        }).catch(log)

        return false
    }

    private async messageEmbed(): Promise<Discord.RichEmbed> {
        const embed = new Discord.RichEmbed()
        const previous = await this.previousPrice()
        const current = await this.currentPrice()
        const ageStr = await this.bot.brain.get(BRAIN_KEYS.AGE)
        if (previous) {
            const btcPreviousDate = Moment().subtract(UPDATE_FREQUENCY, "milliseconds")
            embed.addField(btcPreviousDate.fromNow(), `${previous}\n${CURRENCY_CODE} / BTC`, true)
        }
        if (current) {
            embed.addField("Current", `${current}\n${CURRENCY_CODE} / BTC`, true)
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
        return new Promise((resolve, reject) => {
            const getRequest = HTTPS.get(url, (resp) => {
                resp.on("error", reject)
                const statusCode = resp.statusCode
                const contentType = resp.headers["content-type"]

                let error
                if (statusCode !== 200) {
                  error = new Error("Request Failed.\n" +
                                    `Status Code: ${statusCode}`)
                } else if (!/^application\/json/.test(contentType)) {
                  error = new Error("Invalid content-type.\n" +
                                    `Expected application/json but received ${contentType}`)
                }
                if (error) {
                  reject(error)
                  resp.resume()
                  return
                }

                resp.setEncoding("utf8")
                let rawData = ""
                resp.on("data", (chunk) => rawData += chunk)
                resp.on("end", () => {
                    try {
                        const parsedData = JSON.parse(rawData)
                        resolve(parsedData)
                    } catch (exception) {
                        reject(exception)
                    }
                })
            })
            getRequest.on("error", reject)
        })
    }
}
