/**
 * Scott enough for ya?
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 19/05/19.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { GlobalFeature, MessageContext } from "./feature"

const scomo = "https://tyrone-sudeium.github.io/aethebot-static/res/scomo.jpg"

export class ScomoFeature extends GlobalFeature {
    public handleMessage(context: MessageContext<this>): boolean {
        const msg = context.message.cleanContent.toLowerCase()
        if (!msg.includes("scomo")) {
            return false
        }
        const days = 1000 * 60 * 60 * 24
        // const earliestParliament = new Date("2019-07-02T00:00:00+1000")
        // const latestElection = new Date(earliestParliament.getTime() + (1095 * days))
        const latestElection = new Date("2022-05-21T00:00:00+1000")
        const currentTime = new Date().getTime()
        const timeBetween = latestElection.getTime() - currentTime
        let timePeriod = ""
        if (timeBetween < 0 && (timeBetween / days) > -1) {
            timePeriod = "today"
        } else {
            const daysBetween = Math.ceil(timeBetween / days)
            if (daysBetween === 1) {
                timePeriod = `in ${daysBetween} day`
            } else if (daysBetween > 1) {
                timePeriod = `in ${daysBetween} days`
            }
        }

        if (timePeriod === "") {
            context.sendReply(scomo)
            return true
        } else {
            const replyMsg = `Australia re-elects old mate Scomo ${timePeriod}.` +
            `\n${scomo}` +
            "\n\nRemember to vote! How to vote Liberal: https://www.liberal.org.au/how-to-vote"
            context.sendReply(replyMsg)
        }
        return true
    }
}
