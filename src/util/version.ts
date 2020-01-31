/**
 * Get the current bot revision.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 31/01/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as ChildProcess from "child_process"

export async function sourceVersion(): Promise<string> {
    let version = process.env.SOURCE_VERSION as string
    if (!version) {
        try {
            version = await gitRevision()
        } catch (err) {
            version = "unknown version"
        }
    }
    return version
}

export async function gitRevision(): Promise<string> {
    return new Promise((resolve, reject) => {
        ChildProcess.exec("git rev-parse HEAD", (err, stdout) => {
            if (err) {
                reject(err)
            }
            resolve(stdout.trim())
        })
    })
}
