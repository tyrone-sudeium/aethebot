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

import * as Discord from "discord.js"
import { Feature } from "./feature"

const scomo = "https://cdn.discordapp.com/attachments/293954139845820416/579468190971854849/scomo.jpg"

export class ScomoFeature extends Feature {
    public handleMessage(message: Discord.Message): boolean {
        const msg = message.cleanContent.toLowerCase()
        if (!msg.includes("scomo")) {
            return false
        }
        const days = 1000 * 60 * 60 * 24
        const dateOfElection = new Date(2019, 5, 18)
        // Todo: update when parliament is sworn in
        const earliestParliament = new Date(dateOfElection.getTime() + (30 * days))
        const latestElection = new Date(earliestParliament.getTime() + (1095 * days))
        const timeBetween = latestElection.getTime() - new Date().getTime()
        if (timeBetween < 0) {
            return false
        }
        const daysBetween = Math.ceil(timeBetween / days)
        const replyMsg = `We've got old mate Scomo for at most another ${daysBetween} days.` +
            `\n${scomo}`
        this.replyWith(message, replyMsg)
        return true
    }
}
