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

interface LowestPrice {
    itemName: string
    pricePerCert: number
    price: number
    worldName: string
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

export class FFXIVCertificateFeature extends GlobalFeature {
    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)

        if (tokens.length < 1 ||
            tokens[0].toLowerCase() !== "certificates") {
            return false
        }

        this.getPricesFromUniversalis().then(lowest => {
            context.sendReply("Current best purchase on Elemental: " +
                `"${lowest.itemName}" on ${lowest.worldName} ` +
                `for ${NUMBER_FORMATTER.format(lowest.price)}g ` +
                `(${NUMBER_FORMATTER.format(Math.round(lowest.pricePerCert))}g per certificate).`)
        }).catch(err => {
            log(`amaroquest error: ${err}`, "always")
            context.sendReply("oops something's cooked. check the logs")
        })
        return true
    }

    private async getPricesFromUniversalis(): Promise<LowestPrice> {
        const query = {
            listings: 1,
            hq: true,
            entriesWithin: 60 * 60 * 24, // 24 hours
            fields: [
                "items.listings.pricePerUnit",
                "items.listings.worldName",
            ].join(","),
        }
        const queryStr = queryStringFromObject(query)
        const url = `https://universalis.app/api/v2/Elemental/${IDS.join(",")}?${queryStr}`
        const resp: UniversalisMarketCurrentDataResponse = await getJSON(url)
        if (!resp.items) {
            throw new Error("nothing returned from Universalis")
        }
        let lowest: LowestPrice | undefined
        for (const itemId of IDS) {
            const data = resp.items[itemId]
            if (!data) {
                continue
            }
            if (data.listings.length < 1) {
                continue
            }
            const price = data.listings[0].pricePerUnit
            const certsPerItem = certificateValue(itemId)
            if (certsPerItem === 0) {
                continue
            }
            const pricePerCert = price / certsPerItem
            if (!lowest || pricePerCert < lowest.pricePerCert) {
                const itemName = ITEM_NAMES[itemId]?.en
                if (!itemName) {
                    throw new Error("invalid item id, code needs updating pls")
                }
                lowest = {
                    itemName,
                    pricePerCert,
                    price,
                    worldName: data.listings[0].worldName,
                }
                continue
            }
        }
        if (!lowest) {
            throw new Error("nothing returned from Universalis")
        }
        return lowest
    }
}
