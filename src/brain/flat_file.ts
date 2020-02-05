/**
 * Brain implementation which stores in a flat file on disk.
 * Performance sucks, only use for tiny bot instances, or local dev.
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
import * as FS from "fs"
import StrictEventEmitter from "strict-event-emitter-types/types/src"
import { log } from "../log"
import { Brain, SystemMessages } from "./brain"

export class FlatFileBrain implements Brain {
    public systemMessages: StrictEventEmitter<EventEmitter, SystemMessages> = new EventEmitter()
    private filePath: string
    private storage: {[key: string]: string} = {}
    private saveTimer: NodeJS.Timer | undefined
    private savingLock = false

    public constructor(filePath: string) {
        this.filePath = filePath
        this.load()
    }

    public save(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.savingLock = true
            FS.writeFile(this.filePath, JSON.stringify(this.storage), "utf8", err => {
                this.savingLock = false
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
    }

    public close(): Promise<void> {
        return Promise.resolve()
    }

    public set(key: string, value: string): Promise<void> {
        log(`brain: "${key}" => ${value}`)
        this.storage[key] = value
        if (this.saveTimer) {
            clearTimeout(this.saveTimer)
        }
        if (!this.savingLock) {
            this.saveTimer = setTimeout(() => {
                this.saveTimer = undefined
                this.save()
            }, 20)
        }
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

    private load(): Promise<void> {
        return new Promise((resolve, reject) => {
            FS.readFile(this.filePath, "utf8", (err, data) => {
                if (err) {
                    reject(err)
                    return
                }
                if (data) {
                    Object.assign(this.storage, JSON.parse(data))
                }
            })
        })
    }
}
