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

const scomo = "https://cdn.discordapp.com/attachments/293954139845820416/579468190971854849/scomo.jpg"

export class ScomoFeature extends GlobalFeature {
    public handleMessage(context: MessageContext<this>): boolean {
        const msg = context.message.cleanContent.toLowerCase()
        if (!msg.includes("scomo")) {
            return false
        }
        const days = 1000 * 60 * 60 * 24
        // const earliestParliament = new Date("2019-07-02T00:00:00+1000")
        // const latestElection = new Date(earliestParliament.getTime() + (1095 * days))
        const latestElection = new Date(2022, 4, 21)
        const timeBetween = latestElection.getTime() - new Date().getTime()
        if (timeBetween < 0) {
            return false
        }
        const daysBetween = Math.ceil(timeBetween / days)
        const replyMsg = `Australia re-elects old mate Scomo in ${daysBetween} days.` +
            `\n${scomo}`
        context.sendReply(replyMsg)
        return true
    }
}
