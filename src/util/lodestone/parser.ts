/**
 * FFXIV Lodestone Parser that uses Nodestone under the hood.
 */

/*
* AetheBot - A Discord Chatbot
*
* Created by Tyrone Trevorrow on 05/01/24.
* Copyright (c) 2024 Tyrone Trevorrow. All rights reserved.
*
* This source code is licensed under the permissive MIT license.
*/

import { Character, ClassJob } from "@xivapi/nodestone"
import { CssSelectorRegistry } from "@xivapi/nodestone/types/core/css-selector-registry"
import * as character from "./character.json"
import * as attributes from "./attributes.json"
import * as gearset from "./gearset.json"
import * as classjob from "./classjob.json"

// Here we override Nodestone's CSS selectors to provide the latest
// since Miu hasn't updated the selectors submodule inside Nodestone since the dinosaur age
class CharacterScraper extends Character {
    protected getCSSSelectors(): CssSelectorRegistry {
        return { ...character, ...attributes, ...gearset }
    }
}

class ClassJobScraper extends ClassJob {
    protected getCSSSelectors(): CssSelectorRegistry {
        return classjob
    }
}

const CLASS_ID_MAP = new Map([
    ["paladin", 1],
    ["monk", 2],
    ["warrior", 3],
    ["dragoon", 4],
    ["bard", 5],
    ["whitemage", 6],
    ["blackmage", 7],
    ["scholar", 26],
    ["summoner", 26],
    ["ninja", 29],
    ["machinist", 31],
    ["darkknight", 32],
    ["astrologian", 33],
    ["samurai", 34],
    ["redmage", 35],
    ["bluemage", 36],
    ["gunbreaker", 37],
    ["dancer", 38],
    ["reaper", 39],
    ["sage", 40],
    ["carpenter", 8],
    ["blacksmith", 9],
    ["armorer", 10],
    ["goldsmith", 11],
    ["leatherworker", 12],
    ["weaver", 13],
    ["alchemist", 14],
    ["culinarian", 15],
    ["miner", 16],
    ["botanist", 17],
    ["fisher", 18],
])

interface RawClassJobParsed {
    Level: string
    Unlockstate: string
    CurrentEXP: string | number
    MaxEXP: string | number
}

interface RawCharacterParsed {
    Name: string
    Avatar: string
}

function getCharacterRaw(characterId: number): Promise<RawCharacterParsed> {
    const scraper = new CharacterScraper()
    const res = scraper.parse({params: { characterId: `${characterId}`}} as any)
    return res as unknown as Promise<RawCharacterParsed>
}

function getClassJobRaw(characterId: number): Promise<RawClassJobParsed> {
    const scraper = new ClassJobScraper()
    const res = scraper.parse({params: { characterId: `${characterId}`}} as any)
    return res as unknown as Promise<RawClassJobParsed>
}

interface XIVClassJobInfo {
    classId: number
    level: number
    expLevel: number
}

export interface XIVCharacter {
    character: {
        avatar: string
        id: number
        name: string
        classJobs: XIVClassJobInfo[]
    }
}


function processClassJob(input: RawClassJobParsed, classId: number): XIVClassJobInfo {
    let level = 0
    if (typeof(input.Level) === "string" && input.Level === "-") {
        level = 0
    } else {
        level = parseInt(input.Level, 10)
    }

    let expLevel = 0
    if (input.CurrentEXP === undefined || input.CurrentEXP === "-" || input.CurrentEXP === "--") {
        expLevel = 0
    } else if (typeof(input.CurrentEXP) === "number") {
        expLevel = input.CurrentEXP
    } else {
        expLevel = parseInt(input.CurrentEXP.replace(",", ""), 10)
    }

    return {classId, level, expLevel}
}

export async function getCharacterExpData(characterId: number): Promise<XIVCharacter> {
    const characterData = await getCharacterRaw(characterId)
    const classJobData = await getClassJobRaw(characterId)

    const classJobs: XIVClassJobInfo[] = []
    for (const [key, val] of Object.entries(classJobData)) {
        const classId = CLASS_ID_MAP.get(key.toLowerCase())
        if (!classId) {
            continue
        }
        if (!val) {
            continue
        }
        classJobs.push(processClassJob(val, classId))
    }

    const avatar = characterData.Avatar
    const id = characterId
    const name = characterData.Name
    return { character: { avatar, id, name, classJobs } }
}
