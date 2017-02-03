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

import {RedisClient} from "redis"
import {Brain} from "./brain"

function promisify<T>(func: (callback: (err: any, result: T) => void) => void): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let cb = func((err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

export class RedisBrain implements Brain {
    private _client: RedisClient

    constructor(client: RedisClient) {
        this._client = client
    }

    save(): Promise<void> {
        return promisify<void>((cb) => {
            this._client.bgsave(null, cb)
        })
    }

    close(): Promise<void> {
        return promisify<void>((cb) => {
            this._client.quit(null, cb)
        })
    }

    set(key: string, value: string): Promise<void> {
        return promisify<void>((cb) => {
            this._client.set(key, value, cb)
        })
    }

    get(key: string): Promise<string> {
        return promisify((cb) => {
            this._client.get(key, cb)
        })
    }

    remove(key: string): Promise<void> {
        return promisify<void>((cb) => {
            this._client.del(key, cb)
        })
    }
}
