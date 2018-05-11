/**
 * A persistent model object.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 11/05/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { Bot } from "../bot"
import { Brain } from "../brain"

const symProperties = Symbol.for("persistent:properties")

export abstract class Persistent {
    private bot: Bot

    constructor(bot: Bot) {
        this.bot = bot
    }

    public async save(): Promise<void> {
        const keys = this.persistentKeys()
        const thisAsAny = this as any
        const jsonObj: {[key: string]: any} = {}
        keys.forEach((key) => {
            jsonObj[key] = thisAsAny[key]
        })
        await this.brain.set(this.brainKey, JSON.stringify(jsonObj))
        return this.brain.save()
    }

    public async load(): Promise<void> {
        const keys = this.persistentKeys()
        const thisAsAny = this as any
        const jsonStr = await this.brain.get(this.brainKey)
        if (!jsonStr) {
            return
        }
        const jsonObj = JSON.parse(jsonStr)
        Object.assign(this, jsonObj)
    }

    protected get brain(): Brain {
        return this.bot.brain
    }

    protected abstract get brainKey(): string

    protected persistentKeys(): string[] {
        let properties: string[]
        const klass = Object.getPrototypeOf(this)
        if (klass.hasOwnProperty(symProperties)) {
            properties = klass[symProperties]
        } else {
            properties = klass[symProperties] = []
        }
        return properties
    }

}

type PersistentDecorator<T extends Persistent> = (target: T, propertyKey: string) => void
export function PersistentProperty<T extends Persistent>(key: string | null = null): PersistentDecorator<T> {
    return (target: T, propertyKey: string) => {
        let properties: string[]
        if (Object.prototype.hasOwnProperty.call(target, symProperties)) {
            properties = (target as any)[symProperties]
        } else {
            properties = (target as any)[symProperties] = []
        }
        properties.push(propertyKey)
    }
}
