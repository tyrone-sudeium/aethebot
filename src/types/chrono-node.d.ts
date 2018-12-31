/**
 * Type definition for chrono-node.
 */

/*
 * AetheBot - A Discord Chatbot
 * 
 * Created by Tyrone Trevorrow on 16/04/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 * 
 * This source code is licensed under the permissive MIT license.
 */

declare module "chrono-node" {
    export interface ParsedResult {
        start: ParsedComponents
        end: ParsedComponents | null
        index: number,
        text: string,
        ref: Date
    }

    export interface ParsedComponents {
        knownValues: ParsedComponentsValues
        impliedValues: ParsedComponentsValues
        get(component: keyof ParsedComponentsValues): number | undefined
        assign(component: keyof ParsedComponentsValues, value: number): void
        date(): Date
    }

    export interface ParsedComponentsValues {
        day?: number
        month?: number
        year?: number
        hour?: number
        minute?: number
        second?: number
        millisecond?: number
        timezoneOffset?: number
    }
    export function parse(str: string, ref?: any): ParsedResult[]
}
