/**
 * Gives you countdown times to various events.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 13/06/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */


import * as Moment from "moment"
import { GlobalFeature, MessageContext } from "./feature"
import "moment-precise-range-plugin"

Moment.locale("en")

interface Countdown {
    endTime: Date
    name: string
}

const countdowns = {
    stormblood: {
        endTime: new Date(1497603600000),
        name: "Stormblood Launch",
    },
} as {[name: string]: Countdown}

export class CountdownFeature extends GlobalFeature {
    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)

        if (tokens.length < 1 ||
            tokens[0].toLowerCase() !== "countdown") {
            return false
        }

        const name = tokens.splice(1).join(" ").toLowerCase()
        if (!countdowns[name]) {
            return false
        }
        const countdown = countdowns[name]
        const date = Moment(countdown.endTime)
        const now = Moment()
        const millisUntil = date.unix() - now.unix()
        if (millisUntil > 0) {
            const intervalStr = now.preciseDiff(date)
            context.sendReply(`${countdown.name}: ${intervalStr}`)
        } else {
            context.sendReply(`${countdown.name}: already happened!`)
        }
        return true
    }
}
