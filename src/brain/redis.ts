/* eslint-disable @typescript-eslint/unbound-method */
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

import { EventEmitter } from "events"
import { promisify } from "util"
import { RedisClient } from "redis"
import StrictEventEmitter from "strict-event-emitter-types"
import { v4 as uuid } from "uuid"
import { log } from "../log"
import { Brain, SystemMessages } from "./brain"

const REDIS_KEYS = {
    SYSTEM_MESSAGES_CHANNEL: "ab:sys_msg",
}

interface SystemChannelMessage {
    data?: any
    message: keyof SystemMessages
    sender: string
}

export class RedisPubSubEventEmitter extends EventEmitter {
    private clientID = uuid()
    public constructor(public redis: RedisClient, public publisher: RedisClient) {
        super()
        redis.subscribe(REDIS_KEYS.SYSTEM_MESSAGES_CHANNEL)
        redis.on("message", (channel: string, message: any) => {
            if (channel !== REDIS_KEYS.SYSTEM_MESSAGES_CHANNEL) {
                return
            }
            log(`redis: received: ${message}`)
            const payload = JSON.parse(message)
            if (!payload || !payload.message || typeof(payload.message) !== "string" ) {
                return
            }
            if (!payload.sender || payload.sender === this.clientID) {
                // Ignore messages from this instance
                return
            }
            switch (payload.message) {
            case "reconnect":
                for (const listener of this.listeners("reconnect")) {
                    listener()
                }
                break
            }
        })
    }

    public emit(event: string | symbol, ...args: any[]): boolean {
        if (event !== "reconnect") {
            return false
        }
        let payload: SystemChannelMessage
        if (args.length > 0) {
            payload = {
                data: args[0],
                message: event,
                sender: this.clientID,
            }
        } else {
            payload = {
                message: event,
                sender: this.clientID,
            }
        }
        const payloadStr = JSON.stringify(payload)
        log(`redis: sending: ${payloadStr}`)
        this.publisher.publish(REDIS_KEYS.SYSTEM_MESSAGES_CHANNEL, payloadStr)
        return true
    }
}

export class RedisBrain implements Brain {
    public systemMessages: StrictEventEmitter<EventEmitter, SystemMessages>
    private client: RedisClient
    private storage: {[key: string]: string} = {}

    private redisQuit: () => Promise<"OK">
    private redisSet: (arg1: string, arg2: string) => Promise<unknown>
    private redisGet: (arg1: string) => Promise<string | null>
    private redisDel: (arg1: string) => Promise<number>

    public constructor(client: RedisClient, systemMessagesEmitter: StrictEventEmitter<EventEmitter, SystemMessages>) {
        this.client = client
        this.systemMessages = systemMessagesEmitter
        this.redisQuit = promisify(client.quit).bind(client)
        this.redisSet = promisify(client.set).bind(client)
        this.redisGet = promisify(client.get).bind(client)
        this.redisDel = promisify(client.del).bind(client)
    }

    public save(): Promise<void> {
        // No-op -- doesn't work in heroku redis...?
        return Promise.resolve()
    }

    public async close(): Promise<void> {
        await this.redisQuit()
    }

    public async set(key: string, value: string): Promise<void> {
        this.storage[key] = value
        await this.redisSet(key, value)
    }

    public async get(key: string): Promise<string | null> {
        if (this.storage[key]) {
            return Promise.resolve(this.storage[key])
        }
        const res = await this.redisGet(key)
        if (res) {
            this.storage[key] = res
        } else {
            delete this.storage[key]
        }
        return res
    }

    public async remove(key: string): Promise<void> {
        delete this.storage[key]
        await this.redisDel(key)
    }
}
