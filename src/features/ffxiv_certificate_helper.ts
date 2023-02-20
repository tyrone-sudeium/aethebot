/**
 * Gets the best value items to buy from the FFXIV Market Board to trade for
 * the augmented crafted gear certificate.
 */

/*
* AetheBot - A Discord Chatbot
*
* Created by Tyrone Trevorrow on 19/02/23.
* Copyright (c) 2023 Tyrone Trevorrow. All rights reserved.
*
* This source code is licensed under the permissive MIT license.
*/

import * as Discord from "discord.js"
import { ACCESSORIES, MAJORS, MINORS, ITEM_NAMES } from "../model/ffxiv-items"
import { getJSON, queryStringFromObject } from "../util/http"
import { log } from "../log"
import { GlobalFeature, MessageContext } from "./feature"


// JS APIs really suck.
const IDS = Array.from(new Array(75), (x, i) => i + 37742)
// This is a range, where        ^ length           ^ start pos.

interface UniversalisMarketCurrentDataResponse {
    items?: {
        [itemId: string]: {
            listings: {
                pricePerUnit: number
                worldName: string
            }[]
        }
    }
}

interface PriceInfo {
    itemName: string
    pricePerCert: number
    price: number
    worldName: string
}

const DATA_CENTERS = [
    "aether",
    "crystal",
    "dynamis",
    "primal",
    "chaos",
    "light",
    "elemental",
    "gaia",
    "mana",
    "meteor",
    "materia",
] as const
type DataCenter = typeof DATA_CENTERS[number]

function isDataCenter(str: string): str is DataCenter {
    return (DATA_CENTERS as readonly string[]).includes(str)
}

function certificateValue(itemId: number): number {
    if (MAJORS.has(itemId)) {
        return 17
    }
    if (MINORS.has(itemId)) {
        return 10
    }
    if (ACCESSORIES.has(itemId)) {
        return 7
    }
    return 0
}

// log(`MAJORS = [${Array.from(MAJORS).map(i => ITEM_NAMES[i].en)}]`)
// log(`MINORS = [${Array.from(MINORS).map(i => ITEM_NAMES[i].en)}]`)
// log(`ACCESSORIES = [${Array.from(ACCESSORIES).map(i => ITEM_NAMES[i].en)}]`)

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US")
const NUM_PRICES = 5

function formatPriceInfo(info: PriceInfo): string {
    const price = `${NUMBER_FORMATTER.format(info.price)}g`
    const perCert = `${NUMBER_FORMATTER.format(Math.round(info.pricePerCert))}g`
    return `${price} on ${info.worldName} (${perCert} per cert)`
}

function stupidTitleCase(str: string): string {
    return str[0].toUpperCase() + str.slice(1)
}

function isPriceInfoEqual(p1: PriceInfo, p2: PriceInfo): boolean {
    return p1.itemName === p2.itemName && p1.price === p2.price && p1.worldName === p2.worldName
}

export class FFXIVCertificateFeature extends GlobalFeature {
    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)

        if (tokens.length < 1 ||
            tokens[0].toLowerCase() !== "certificates") {
            return false
        }
        let dc: DataCenter = "elemental"
        if (tokens.length === 2) {
            const potentialDc = tokens[1].toLowerCase()
            if (!isDataCenter(potentialDc)) {
                context.sendNegativeReply(`"${tokens[1]}" is not a recognised data centre`)
                return false
            }
            dc = potentialDc
        }

        this.getPricesFromUniversalis(dc).then(prices => {
            const embed = new Discord.MessageEmbed()
            embed.setTitle(`Best Prices on ${stupidTitleCase(dc)}`)
            for (const priceInfo of prices) {
                embed.addField(priceInfo.itemName, formatPriceInfo(priceInfo), false)
            }
            context.message.channel.send(embed)
        }).catch(err => {
            log(`ffxiv_certificate_helper error: ${err}`, "always")
            context.sendReply("oops something's cooked. check the logs")
        })
        return true
    }

    private async getPricesFromUniversalis(dataCenter: DataCenter): Promise<PriceInfo[]> {
        const query = {
            listings: 3,
            hq: true,
            entriesWithin: 60 * 60 * 24, // 24 hours
            fields: [
                "items.listings.pricePerUnit",
                "items.listings.worldName",
            ].join(","),
        }
        const queryStr = queryStringFromObject(query)
        const url = `https://universalis.app/api/v2/${dataCenter}/${IDS.join(",")}?${queryStr}`
        const resp: UniversalisMarketCurrentDataResponse = await getJSON(url)
        if (!resp.items) {
            throw new Error("nothing returned from Universalis")
        }
        const priceInfo: PriceInfo[] = []
        for (const itemId of IDS) {
            const data = resp.items[itemId]
            if (!data) {
                continue
            }
            if (data.listings.length < 1) {
                continue
            }
            for (const listing of data.listings) {
                const price = listing.pricePerUnit
                const certsPerItem = certificateValue(itemId)
                if (certsPerItem === 0) {
                    continue
                }
                const pricePerCert = price / certsPerItem
                if (priceInfo.length < NUM_PRICES || pricePerCert < priceInfo[NUM_PRICES - 1].pricePerCert) {
                    const itemName = ITEM_NAMES[itemId]?.en
                    if (!itemName) {
                        throw new Error("invalid item id, code needs updating pls")
                    }
                    if (priceInfo.length >= NUM_PRICES) {
                        priceInfo.pop()
                    }
                    const newPrice = {
                        itemName,
                        pricePerCert,
                        price,
                        worldName: data.listings[0].worldName,
                    }
                    // This reads a bit galaxy-brain but basically, disallows duplicates.
                    // Duplicates are possible because people can make _multiple listings_ at the same price.
                    if (priceInfo.findIndex(p => isPriceInfoEqual(p, newPrice)) === -1) {
                        priceInfo.push(newPrice)
                    }
                    // This is sadge (remember we're nested two loops deep right now), but
                    // I can't be bothered thinking of an algorithmically quicker way right now.
                    priceInfo.sort((a, b) => a.pricePerCert - b.pricePerCert)
                    continue
                }
            }
        }
        if (priceInfo.length === 0) {
            throw new Error("nothing returned from Universalis")
        }
        return priceInfo
    }
}
