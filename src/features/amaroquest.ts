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
import { log } from "../log"
import { GlobalFeature, MessageContext } from "./feature"

const EXP_CURVE = [
    300,
    450,
    630,
    970,
    1440,
    1940,
    3000,
    3920,
    4970,
    5900,
    7430,
    8620,
    10200,
    11300,
    13100,
    15200,
    17400,
    19600,
    21900,
    24300,
    27400,
    30600,
    33900,
    37300,
    40800,
    49200,
    54600,
    61900,
    65600,
    68400,
    74000,
    82700,
    88700,
    95000,
    102000,
    113000,
    121000,
    133000,
    142000,
    155000,
    163000,
    171000,
    179000,
    187000,
    195000,
    214000,
    229000,
    244000,
    259000,
    421000,
    500000,
    580000,
    663000,
    749000,
    837000,
    927000,
    1019000,
    1114000,
    1211000,
    1387000,
    1456000,
    1534000,
    1621000,
    1720000,
    1834000,
    1968000,
    2126000,
    2137000,
    2550000,
    2923000,
    3018000,
    3153000,
    3324000,
    3532000,
    3770600,
    4066000,
    4377000,
    4777000,
    5256000,
    5992000,
    6171000,
    6942000,
    7205000,
    7948000,
    8287000,
    9231000,
    9529000,
    10459000,
    10838000,
]

const ADVENTURER_CLASSES: {[id: number]: {id: number; startsAt: number}} = {
    1: { id: 1, startsAt: 1 }, // GLA/PLD
    2: { id: 2, startsAt: 1 }, // PGL/MNK
    3: { id: 3, startsAt: 1 }, // MRD/WAR
    4: { id: 4, startsAt: 1 }, // LNC/DRG
    5: { id: 5, startsAt: 1 }, // ARC/BRD
    6: { id: 6, startsAt: 1 }, // CNJ/WHM
    7: { id: 7, startsAt: 1 }, // THM/BLM
    26: { id: 26, startsAt: 1 }, // ACN/SCH/SMN
    29: { id: 29, startsAt: 1 }, // ROG/NIN
    31: { id: 31, startsAt: 30 }, // MCH
    32: { id: 32, startsAt: 30 }, // DRK
    33: { id: 33, startsAt: 30 }, // AST
    34: { id: 34, startsAt: 50 }, // SAM
    35: { id: 35, startsAt: 50 }, // RDM
    37: { id: 37, startsAt: 60 }, // GNB
    38: { id: 38, startsAt: 60 }, // DNC
    39: { id: 39, startsAt: 70 }, // RPR
    40: { id: 40, startsAt: 70 }, // SGE
}

function expEarned(level: number, startsAt = 1): number {
    if (level < startsAt) {
        return 0
    }
    const curve = EXP_CURVE.slice(startsAt - 1)
    return curve.slice(0, level - startsAt).reduce((a,x) => a + x, 0)
}

const TOTAL_EXP = Object.entries(ADVENTURER_CLASSES)
    .map(([,cls]) => expEarned(90, cls.startsAt))
    .reduce((a,n) => a + n)

const NUMBER_FORMATTER = new Intl.NumberFormat("en-US")

interface XIVAPICharacter {
    Character: {
        Avatar: string
        ID: number
        Name: string
        ClassJobs: {
            ClassID: number
            Level: number
            ExpLevel: number
        }[]
    }
}

const ORDINALS = ["First", "Second", "Third", "Fourth", "Fifth"]
const COLORS = ["#FFD700", "#C0C0C0", "#804000", "#0000A0", "#0000A0"] as Discord.HexColorString[]

interface LeaderboardData {
    name: string
    cumulativeExp: number
    url: string
    avatarURL: string
    position: string
    prevExp: number | null
}

interface History {
    [charId: string]: number
}

function totalExpForToon(toon: XIVAPICharacter): number {
    let exp = 0
    const classesCounted: Set<number> = new Set()
    for (const job of toon.Character.ClassJobs) {
        // Dumb Arcanist workaround
        if (classesCounted.has(job.ClassID)) {
            continue
        }
        const cls = ADVENTURER_CLASSES[job.ClassID]
        if (!cls) {
            continue
        }
        if (job.Level === 0) {
            continue
        }
        const earned = expEarned(job.Level, cls.startsAt)
        exp = exp + earned + job.ExpLevel
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

function embedForLeaderboardData(data: LeaderboardData, idx: number): Discord.EmbedBuilder {
    const embed = new Discord.EmbedBuilder()
    const totalExp = NUMBER_FORMATTER.format(TOTAL_EXP)
    const cumulativeExp = NUMBER_FORMATTER.format(data.cumulativeExp)
    const completion = (data.cumulativeExp / TOTAL_EXP) * 100
    embed.setAuthor({name: data.name, iconURL: data.avatarURL, url: data.url})
    embed.setTitle(`${data.position} Place (${completion.toFixed(2)}%)`)
    if (data.prevExp && data.cumulativeExp > data.prevExp) {
        const diff = data.cumulativeExp - data.prevExp
        const diffPerc = completion - ((data.prevExp / TOTAL_EXP) * 100)
        const diffPercStr = diffPerc.toFixed(2)
        if (diff > 1000000) {
            embed.setDescription(`Up **${(diff / 1000000.0).toFixed(1)}M** (${diffPercStr}%) since last time`)
        } else if (diff > 10000) {
            embed.setDescription(`Up **${(diff / 1000).toFixed(0)}K** (${diffPercStr}%) since last time`)
        } else {
            embed.setDescription(`Up **${diff}** (${diffPercStr}%) since last time`)
        }
    }
    embed.setFooter({text: `${cumulativeExp} / ${totalExp} Total EXP`})
    embed.setColor(COLORS[idx])
    return embed
}

export class AmaroQuestFeature extends GlobalFeature {
    public handleMessage(context: MessageContext<this>): boolean {
        this.handleMessageAsync(context)
        return false
    }

    private async getHistory(context: MessageContext<this>): Promise<History> {
        if (context.message.channel.type === Discord.ChannelType.DM || !context.message.guild) {
            return {}
        }
        const redisKey = `aq:${context.message.guild.id}:history`
        const historyStr = await this.bot.brain.get(redisKey) ?? "{}"
        const history: History = JSON.parse(historyStr)
        return history
    }

    private async setHistory(history: History, context: MessageContext<this>): Promise<void> {
        if (context.message.channel.type === Discord.ChannelType.DM || !context.message.guild) {
            return
        }
        const redisKey = `aq:${context.message.guild.id}:history`
        const historyStr = JSON.stringify(history)
        await this.bot.brain.set(redisKey, historyStr)
    }

    private async handleMessageAsync(context: MessageContext<this>): Promise<void> {
        const tokens = this.commandTokens(context)
        if (tokens.length < 1) {
            return
        }

        if (tokens[0] !== "amaroquest") {
            return
        }

        if (context.message.channel.type === Discord.ChannelType.DM || !context.message.guild) {
            return
        }
        if (context.message.channel.type === Discord.ChannelType.GuildStageVoice) {
            return
        }

        const amaroQuestersStr = await this.bot.brain.get(`aq:${context.message.guild.id}`) ?? "[]"
        const amaroQuesters: number[] = JSON.parse(amaroQuestersStr)
        const history = await this.getHistory(context)

        if (tokens.length < 2) {
            if (amaroQuesters.length === 0) {
                context.sendNegativeReply("nobody on the leaderboard. use `amaroquest add [character-id]`")
                return
            }
            let leaderboard: LeaderboardData[] = []
            const dataPromises: Promise<XIVAPICharacter>[] = amaroQuesters
                .map(id => getJSON(`https://xivapi.com/character/${id}`))
            try {
                const data = await Promise.all(dataPromises)
                for (const charData of data) {
                    const name = charData.Character.Name
                    const cumulativeExp = totalExpForToon(charData)
                    const url = `https://na.finalfantasyxiv.com/lodestone/character/${charData.Character.ID}/`
                    const avatarURL = charData.Character.Avatar
                    const prevExp = history[charData.Character.ID] ?? null
                    history[charData.Character.ID] = cumulativeExp
                    leaderboard.push({name, cumulativeExp, url, avatarURL, position: "", prevExp})
                }
            } catch (error) {
                log(`amaroquest error: ${error}`, "always")
                context.sendReply("oops something's cooked. check the logs")
                return
            }
            await this.setHistory(history, context)
            leaderboard = sortLeaderboard(leaderboard)
            const embeds = leaderboard.map(embedForLeaderboardData)
            await context.sendReply("", embeds)
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
