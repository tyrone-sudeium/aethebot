/**
 * Brain implementation that stores in a Redis instance.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { RedisClient } from "redis"
import { log } from "../log"
import { Brain } from "./brain"

function promisify<T>(func: (callback: (err: any, result: T) => void) => void): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const cb = func((err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

export class RedisBrain implements Brain {
    private client: RedisClient
    private storage: {[key: string]: string} = {}

    constructor(client: RedisClient) {
        this.client = client
    }

    public save(): Promise<void> {
        // No-op -- doesn't work in heroku redis...?
        return Promise.resolve()
    }

    public close(): Promise<void> {
        return promisify<void>((cb) => {
            this.client.quit(cb)
        })
    }

    public set(key: string, value: string): Promise<void> {
        this.storage[key] = value
        return promisify<void>((cb) => {
            this.client.set(key, value, cb)
        })
    }

    public get(key: string): Promise<string | null> {
        if (this.storage[key]) {
            return Promise.resolve(this.storage[key])
        }
        return promisify<string | null>((cb) => {
            this.client.get(key, cb)
        }).then((res) => {
            if (res) {
                this.storage[key] = res
            } else {
                delete this.storage[key]
            }
            return Promise.resolve(res)
        })
    }

    public remove(key: string): Promise<void> {
        delete this.storage[key]
        return promisify<void>((cb) => {
            this.client.del(key, cb)
        })
    }
}
