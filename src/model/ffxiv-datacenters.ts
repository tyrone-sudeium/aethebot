/**
 * FFXIV Data Centres
 */

/*
* AetheBot - A Discord Chatbot
*
* Created by Tyrone Trevorrow on 04/01/24.
* Copyright (c) 2024 Tyrone Trevorrow. All rights reserved.
*
* This source code is licensed under the permissive MIT license.
*/

export const DATA_CENTERS = [
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
export type DataCenter = typeof DATA_CENTERS[number]

export function isDataCenter(str: string): str is DataCenter {
    return (DATA_CENTERS as readonly string[]).includes(str)
}
