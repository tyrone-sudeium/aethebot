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

import {Brain} from "./brain"

export class MemoryBrain implements Brain {
    private _storage: {[key: string]: string} = {}
    save(): Promise<void> {
        return Promise.resolve()
    }

    close(): Promise<void> {
        return Promise.resolve()
    }

    set(key: string, value: string): Promise<void> {
        this._storage[key] = value
        return Promise.resolve()
    }

    get(key: string): Promise<string> {
        const value = this._storage[key]
        return Promise.resolve(value)
    }

    remove(key: string): Promise<void> {
        delete this._storage[key]
        return Promise.resolve()
    }
}
