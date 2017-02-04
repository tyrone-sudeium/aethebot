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
import {log} from "../log"

function promisify<T>(func: (callback: (err: any, result: T) => void) => void): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        let cb = func((err, res) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

export class RedisBrain implements Brain {
    private _client: RedisClient
    private _storage: {[key: string]: string} = {}

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
        this._storage[key] = value
        return promisify<void>((cb) => {
            this._client.set(key, value, cb)
        })
    }

    get(key: string): Promise<string> {
        if (this._storage[key]) {
            return Promise.resolve(this._storage[key])
        }
        return promisify<string>((cb) => {
            this._client.get(key, cb)
        }).then((res) => {
            this._storage[key] = res
            return Promise.resolve(res)
        })
    }

    remove(key: string): Promise<void> {
        return promisify<void>((cb) => {
            this._client.del(key, cb)
        })
    }
}
