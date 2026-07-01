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
import { ACCESSORIES, MAJORS, MINORS, ITEM_NAMES, STARTING_ID } from "../model/ffxiv-items"
import { getJSON, queryStringFromObject } from "../util/http"
import { log } from "../log"
import { DataCenter, isDataCenter } from "../model/ffxiv-datacenters"
import { stupidTitleCase } from "../util/string_stuff"
import { GlobalFeature, MessageContext } from "./feature"


// JS APIs really suck.
const IDS = Array.from(new Array(77), (x, i) => i + STARTING_ID)
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
    itemId: number
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

function isPriceInfoEqual(p1: PriceInfo, p2: PriceInfo): boolean {
    return p1.itemName === p2.itemName && p1.price === p2.price && p1.worldName === p2.worldName
}

export class FFXIVCertificateFeature extends GlobalFeature {
    public async handleInteraction(interaction: Discord.Interaction<Discord.CacheType>): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return
        }

        const dc = interaction.options.getString("datacentre")
        if (!dc) {
            // This is required? lul.
            await interaction.reply({content: "⚠️ Missing data centre. Try `/xiv certificates [dc]`", ephemeral: true})
            return
        }
        if (!isDataCenter(dc)) {
            await interaction.reply({content: `⚠️ \`${dc}\` is not a recognised data centre`, ephemeral: true})
            return
        }

        const ephemeral = !(interaction.options.getBoolean("public") ?? false)
        await interaction.deferReply({ephemeral})
        try {
            const prices = await this.getPricesFromUniversalis(dc)
            const embeds = prices.map((priceInfo, index) => {
                const embed = new Discord.EmbedBuilder()
                const thumb = `https://universalis-ffxiv.github.io/universalis-assets/icon2x/${priceInfo.itemId}.png`
                embed.setAuthor({
                    name: `#${index+1} ${priceInfo.itemName}`,
                    iconURL: thumb,
                    url: `https://universalis.app/market/${priceInfo.itemId}`,
                })
                embed.setFooter({text: formatPriceInfo(priceInfo)})
                return embed
            })
            interaction.editReply({embeds})
        } catch(err) {
            log(`ffxiv_certificate_helper error: ${err}`, "always")
            interaction.editReply({content: "⚠️ Oops something's cooked. Check the logs."})
        }
    }

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
            const embeds = prices.map((priceInfo, index) => {
                const embed = new Discord.EmbedBuilder()
                const thumb = `https://universalis-ffxiv.github.io/universalis-assets/icon2x/${priceInfo.itemId}.png`
                embed.setAuthor({
                    name: `#${index+1} ${priceInfo.itemName}`,
                    iconURL: thumb,
                    url: `https://universalis.app/market/${priceInfo.itemId}`,
                })
                embed.setFooter({text: formatPriceInfo(priceInfo)})
                return embed
            })
            context.sendReply(`Best Prices on ${stupidTitleCase(dc)}`, embeds)
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
                        itemId,
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
