/**
 * Debug logging.
 */

/*
 * AetheBot - A Discord Chatbot
 * 
 * Created by Tyrone Trevorrow on 05/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 * 
 * This source code is licensed under the permissive MIT license.
 */

export function log(msg: string) {
    const debug = (process.env["NODE_ENV"] || "development") == "development"
    if (debug) {
        console.log(msg)
    }
}
