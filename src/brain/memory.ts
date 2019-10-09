/**
 * Brain implementation which stores in memory.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { EventEmitter } from "events"
import StrictEventEmitter from "strict-event-emitter-types/types/src"
import { log } from "../log"
import { Brain, SystemMessages } from "./brain"

export class MemoryBrain implements Brain {
    public systemMessages: StrictEventEmitter<EventEmitter, SystemMessages> = new EventEmitter()

    private storage: {[key: string]: string} = {}
    public save(): Promise<void> {
        return Promise.resolve()
    }

    public close(): Promise<void> {
        return Promise.resolve()
    }

    public set(key: string, value: string): Promise<void> {
        log(`brain: "${key}" => ${value}`)
        this.storage[key] = value
        return Promise.resolve()
    }

    public get(key: string): Promise<string | null> {
        const value = this.storage[key]
        return Promise.resolve(value)
    }

    public remove(key: string): Promise<void> {
        delete this.storage[key]
        return Promise.resolve()
    }
}
