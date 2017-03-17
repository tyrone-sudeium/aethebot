/**
 * Basically the Airhorn Solutions feature.
 */

/*
 * AetheBot - A Discord Chatbot
 * 
 * Created by Tyrone Trevorrow on 11/03/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 * 
 * This source code is licensed under the permissive MIT license.
 */

import { Feature } from "./feature"
import * as Discord from "discord.js"
import * as Path from "path"

function _pathForNoiseFile(noiseFile: string) {
    return Path.join(process.cwd(), "res", noiseFile)
}

interface Noise {
    id: string,
    file: string,
    regex: RegExp[]
}

const NOISES: Noise[] = [
    {
        "id": "OSTRICH",
        "file": _pathForNoiseFile("ostrich.mp3"),
        "regex": [/^haha\!?$/i, /^ostrich$/i]
    },
    {
        "id": "THEBEST4",
        "file": _pathForNoiseFile("thebest4.mp3"),
        "regex": [/^the\s?best$/i]
    },
    {
        "id": "ENYA",
        "file": _pathForNoiseFile("enya.mp3"),
        "regex": [/^enya$/i, /^only\s?time$/i, /^enya\s-*\sonly\stime$/i]
    },
    {
        "id": "DEADINSIDE",
        "file": _pathForNoiseFile("deadinside.mp3"),
        "regex": [/^dead\sinside$/i]
    },
    {
        "id": "OHJEEZ",
        "file": _pathForNoiseFile("ohjeez.mp3"),
        "regex": [/^o+h+ [gj]ee+z+$/i]
    }
]

enum VoicePlaybackStatus {
    Waiting,
    Connecting,
    Playing,
    Finished
}

interface VoicePlaybackIntent {
    noise: Noise
    channel: Discord.VoiceChannel
    state: VoicePlaybackStatus
    connection?: Discord.VoiceConnection
}

export class VoiceNoiseFeature extends Feature {
    pendingPlayback: { [chanId: string]: VoicePlaybackIntent[] } = {}

    handleMessage(message: Discord.Message): boolean {
        if (message.author.equals(this.bot.user)) {
            return false
        }

        if (!message.isMentioned(this.bot.user) ||
            message.mentions.users.size !== 1) {
            return false
        }

        const tokens = this.commandTokens(message)
        const noise = this._noiseForMessage(tokens.join(" "))
        if (!noise) {
            return false
        }
        const serverChannels = message.guild.channels
        const authorVoiceChannels = serverChannels
            .filter((chan: Discord.GuildChannel) => {
                if (chan.type === "voice") {
                    const vchan = chan as any as Discord.VoiceChannel
                    if (vchan.members.get(message.author.id)) {
                        return true
                    } else {
                        return false
                    }
                }
            })

        if (authorVoiceChannels.array().length === 0) {
            return false
        }
        const channel: Discord.VoiceChannel = authorVoiceChannels.first() as any

        this._pushPlaybackIntent(channel, {
            noise: noise,
            channel: channel,
            state: VoicePlaybackStatus.Waiting
        })
        return true
    }

    private _noiseForMessage(message: string): Noise {
        for (let noise of NOISES) {
            if (noise.regex.find(r => r.test(message))) {
                return noise
            }
        }
        return null
    }

    private _pushPlaybackIntent(channel: Discord.VoiceChannel,
        intent: VoicePlaybackIntent) {
        let playQueue = this.pendingPlayback[channel.id]
        if (!playQueue) {
            playQueue = []
            this.pendingPlayback[channel.id] = playQueue
        }
        playQueue.push(intent)
        this._updatePlaybackQueue(channel.id)
    }

    private _updateAllPlaybackQueues() {
        for (let chanId in this.pendingPlayback) {
            const queue = this.pendingPlayback[chanId]
            if (queue.length === 0) {
                continue
            } else {
                this._updatePlaybackQueue(chanId)
            }
        }
    }

    private _updatePlaybackQueue(chanId: string) {
        const queue = this.pendingPlayback[chanId]
        const top = queue[0]
        if (top.state === VoicePlaybackStatus.Waiting) {
            if (!top.channel.connection) {
                top.state = VoicePlaybackStatus.Connecting
                top.channel.join().then(conn => {
                    top.connection = conn
                    this._updatePlaybackQueue(chanId)
                }).catch(console.error)
            } else {
                top.connection = top.channel.connection
                top.state = VoicePlaybackStatus.Connecting
                this._updatePlaybackQueue(chanId)
            }
        } else if (top.state === VoicePlaybackStatus.Connecting) {
            if (top.connection) {
                top.state = VoicePlaybackStatus.Playing
                const d = top.connection.playFile(top.noise.file)
                d.on("end", () => {
                    top.state = VoicePlaybackStatus.Finished
                    this._updatePlaybackQueue(chanId)
                })
            }
        } else if (top.state === VoicePlaybackStatus.Playing) {
            // Ignore it, it's still playing
        } else if (top.state === VoicePlaybackStatus.Finished) {
            // Pop from the top
            queue.shift()
            if (queue.length === 0) {
                top.channel.leave()
            } else {
                this._updatePlaybackQueue(chanId)
            }
        }
    }
}
