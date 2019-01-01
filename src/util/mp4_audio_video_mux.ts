/**
 * Combines a video-only MP4 and an audio-only MP4 into an AV MP4 using FFMPEG.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 01/01/19.
 * Copyright (c) 2019 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */
import { spawn, spawnSync } from "child_process"

let FFMPEG_COMMAND: string

function getFFMPEGExecutable(): string {
    if (FFMPEG_COMMAND) {
        return FFMPEG_COMMAND
    }
    for (const command of ["ffmpeg", "avconv", "./ffmpeg", "./avconv"]) {
        if (!spawnSync(command, ["-h"]).error) {
            FFMPEG_COMMAND = command
            return FFMPEG_COMMAND
        }
    }
    throw new Error("FFMPEG not found")
}

export async function muxMP4(videoPath: string, audioPath: string, joinedPath: string): Promise<string> {
    const args = [
        "-i", videoPath,
        "-i", audioPath,
        "-codec", "copy",
        joinedPath,
    ]
    const process = spawn(getFFMPEGExecutable(), args)
    return new Promise<string>((resolve, reject) => {
        process.on("close", (code) => {
            if (code === 0) {
                resolve(joinedPath)
            } else {
                reject(`FFMPEG terminated with abnormal code: ${code}`)
            }
        })
    })
}
