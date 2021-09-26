/**
 * FFXIV levelling leaderboard.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 02/06/21.
 * Copyright (c) 2021 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import { getJSON } from "../util/http"
import { GlobalFeature, MessageContext } from "./feature"

const EXP_CURVE = [
    300,
    600,
    1100,
    1700,
    2300,
    4200,
    6000,
    7350,
    9930,
    11800,
    15600,
    19600,
    23700,
    26400,
    30500,
    35400,
    40500,
    45700,
    51000,
    56600,
    63900,
    71400,
    79100,
    87100,
    95200,
    109800,
    124800,
    140200,
    155900,
    162500,
    175900,
    189600,
    203500,
    217900,
    232320,
    249900,
    267800,
    286200,
    304900,
    324000,
    340200,
    356800,
    373700,
    390800,
    408200,
    437600,
    467500,
    498000,
    529000,
    864000,
    1058400,
    1267200,
    1555200,
    1872000,
    2217600,
    2592000,
    2995200,
    3427200,
    3888000,
    4470000,
    4873000,
    5316000,
    5809000,
    6364000,
    6995000,
    7722000,
    8575000,
    9593000,
    10826000,
    12449000,
    13881000,
    15556000,
    17498600,
    19750000,
    22330000,
    25340000,
    28650000,
    32750000,
    37650000,
]

const ADVENTURER_CLASSES = [
    1, // GLA/PLD
    2, // PGL/MNK
    3, // MRD/WAR
    4, // LNC/DRG
    5, // ARC/BRD
    6, // CNJ/WHM
    7, // THM/BLM
    26, // ACN/SCH/SMN
    29, // ROG/NIN
    31, // MCH
    33, // AST
    32, // DRK
    34, // SAM
    35, // RDM
    37, // GNB
    38, // DNC
]

const TOTAL_EXP = EXP_CURVE.reduce((a,x) => a + x) * ADVENTURER_CLASSES.length

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US")

interface XIVAPICharacter {
    Character: {
        Avatar: string
        Name: string
        ClassJobs: {
            ClassID: number
            Level: number
            ExpLevel: number
        }[]
    }
}

const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth"]
const COLORS = ["#FFD700", "#C0C0C0", "#804000", "#0000A0", "#0000A0"]

interface LeaderboardData {
    name: string
    cumulativeExp: number
    url: string
    avatarURL: string
    position: string
}

function totalExpForToon(toon: XIVAPICharacter): number {
    let exp = 0
    const classesCounted: Set<number> = new Set()
    for (const job of toon.Character.ClassJobs) {
        // Dumb Arcanist workaround
        if (classesCounted.has(job.ClassID)) {
            continue
        }
        if (!ADVENTURER_CLASSES.includes(job.ClassID)) {
            continue
        }
        if (job.Level === 0) {
            continue
        }
        const expEarned = EXP_CURVE.slice(0, job.Level - 1).reduce((a,x) => a + x)
        exp = exp + expEarned + job.ExpLevel
        classesCounted.add(job.ClassID)
    }
    return exp
}

function sortLeaderboard(leaderboard: LeaderboardData[]): LeaderboardData[] {
    leaderboard.sort((a, b) => b.cumulativeExp - a.cumulativeExp)
    let prevPos = 0
    let prevExp = -1
    let idx = 0
    for (const data of leaderboard) {
        if (prevExp === data.cumulativeExp) {
            prevExp = data.cumulativeExp
            data.position = ORDINALS[prevPos]
            idx++
        } else {
            prevExp = data.cumulativeExp
            data.position = ORDINALS[idx]
            prevPos = idx
            idx++
        }
    }
    return leaderboard
}

function embedForLeaderboardData(data: LeaderboardData, idx: number): Discord.MessageEmbed {
    const embed = new Discord.MessageEmbed()
    const totalExp = NUMBER_FORMATTER.format(TOTAL_EXP)
    const cumulativeExp = NUMBER_FORMATTER.format(data.cumulativeExp)
    embed.setAuthor(data.name, data.avatarURL, data.url)
    embed.setTitle(`${data.position} Place`)
    embed.setFooter(`${cumulativeExp} / ${totalExp} Total EXP`)
    embed.setColor(COLORS[idx])
    return embed
}

export class AmaroQuestFeature extends GlobalFeature {
    public handleMessage(context: MessageContext<this>): boolean {
        this.handleMessageAsync(context)
        return false
    }

    private async handleMessageAsync(context: MessageContext<this>): Promise<void> {
        const tokens = this.commandTokens(context)
        if (tokens.length < 1) {
            return
        }

        if (tokens[0] !== "amaroquest") {
            return
        }

        if (context.message.channel.type === "dm" || !context.message.guild) {
            return
        }

        const amaroQuestersStr = await this.bot.brain.get(`aq:${context.message.guild.id}`) ?? "[]"
        const amaroQuesters: number[] = JSON.parse(amaroQuestersStr)

        if (tokens.length < 2) {
            let leaderboard: LeaderboardData[] = []
            for (const leaderboardCharId of amaroQuesters) {
                const charData: XIVAPICharacter = await getJSON(`https://xivapi.com/character/${leaderboardCharId}`)
                const name = charData.Character.Name
                const cumulativeExp = totalExpForToon(charData)
                const url = `https://na.finalfantasyxiv.com/lodestone/character/${leaderboardCharId}/`
                const avatarURL = charData.Character.Avatar
                leaderboard.push({name, cumulativeExp, url, avatarURL, position: ""})
            }
            leaderboard = sortLeaderboard(leaderboard)
            const embeds = leaderboard.map(embedForLeaderboardData)
            // This isn't great... Discord doesn't guarantee message ordering, plus this is spam
            for (const embed of embeds) {
                await context.message.channel.send(embed)
            }
            return
        }

        if (tokens.length < 3) {
            return
        }

        const action = tokens[1].toLowerCase()
        const charId = parseInt(tokens[2], 10)
        if (isNaN(charId) || charId > 4294967295 || charId < 0) {
            context.sendNegativeReply("bad character id")
            return
        }

        if (action === "add") {
            if (amaroQuesters.length >= 5) {
                context.sendNegativeReply("I can only track a maximum of 5 amaroquesters per discord server")
                return
            }
            const idx = amaroQuesters.indexOf(charId)
            if (idx < 0) {
                amaroQuesters.push(charId)
                await this.bot.brain.set(`aq:${context.message.guild.id}`, JSON.stringify(amaroQuesters))
            }
            context.sendReply("ok")
            return
        }

        if (action === "remove" || action === "delete") {
            const idx = amaroQuesters.indexOf(charId)
            if (idx < 0) {
                context.sendNegativeReply("that character is not in amaro quest")
                return
            }
            amaroQuesters.splice(idx, 1)
            await this.bot.brain.set(`aq:${context.message.guild.id}`, JSON.stringify(amaroQuesters))
            context.sendReply("ok")
        }
    }
}
