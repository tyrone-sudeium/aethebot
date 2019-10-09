import StrictEventEmitter from "strict-event-emitter-types"
import { EventEmitter } from "events"

/**
 * Abstract memory store for the bot.
 */

/*
 * AetheBot - A Discord Chatbot
 * 
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 * 
 * This source code is licensed under the permissive MIT license.
 */

interface SystemMessages {
    reconnect: void
}

export interface Brain {
    /** Forces the Brain to save or persist its data. */
    save(): Promise<void>
    /** Requests the Brain to close any connections. */
    close(): Promise<void>
    /** Sets value for key. */
    set(key: string, value: string): Promise<void>
    /** Returns value for a given key, or null if not found. */
    get(key: string): Promise<string | null>
    /** Removes value for a given key, if any. */
    remove(key: string): Promise<void>
    /** System messages events */
    systemMessages: StrictEventEmitter<EventEmitter, SystemMessages>
}
