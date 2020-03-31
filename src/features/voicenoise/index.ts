
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

import * as FS from "fs"
import * as Path from "path"
import * as Discord from "discord.js"
import { GlobalFeature, MessageContext } from "../feature"
import { Noise, NOISES } from "./noises"

/* eslint-disable no-console */

// Import prism without types right now because they haven't published TS3-compatible types yet
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Prism = require("prism-media")

function pathForNoiseFile(noiseFile: string): string {
    return Path.join(process.cwd(), "res", noiseFile)
}

enum VoicePlaybackStatus {
    Waiting,
    Connecting,
    Playing,
    Finished,
}

interface VoicePlaybackIntent {
    noise: Noise
    channel: Discord.VoiceChannel
    state: VoicePlaybackStatus
    connection?: Discord.VoiceConnection
}

export class VoiceNoiseFeature extends GlobalFeature {
    private pendingPlayback = new Map<string, VoicePlaybackIntent[]>()

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        const message = context.message
        const noise = this.noiseForMessage(tokens.join(" "))
        if (!noise) {
            return false
        }

        if (!message.member || !message.member.voiceChannel) {
            if (noise.fallbackImageURL) {
                const embed = new Discord.RichEmbed()
                embed.setImage(noise.fallbackImageURL)
                message.channel.sendEmbed(embed)
                return true
            }
            return false
        }
        const authorVoiceChannel = message.member.voiceChannel
        if (!authorVoiceChannel.joinable) {
            context.sendNegativeReply("can't join your channel")
            return true
        }

        this.pushPlaybackIntent(authorVoiceChannel, {
            channel: authorVoiceChannel,
            noise,
            state: VoicePlaybackStatus.Waiting,
        })
        return true
    }

    public voiceChannelStateChanged(channel: Discord.VoiceChannel): void {
        if (this.shouldLeaveChannel(channel)) {
            channel.leave()
        }
    }

    private shouldLeaveChannel(channel: Discord.VoiceChannel): boolean {
        if (channel.members.size !== 1) {
            return false
        }
        if (!channel.connection) {
            return false
        }
        const botUser = this.bot.user
        if (!botUser) {
            return false
        }
        if (channel.members.last().user.equals(botUser)) {
            return true
        }
        return false
    }

    private noiseForMessage(message: string): Noise | null {
        for (const noise of NOISES) {
            if (noise.regex.find(r => r.test(message))) {
                return noise
            }
        }
        return null
    }

    private pushPlaybackIntent(channel: Discord.VoiceChannel,
                               intent: VoicePlaybackIntent): void {
        let playQueue = this.pendingPlayback.get(channel.id)
        if (!playQueue) {
            playQueue = []
            this.pendingPlayback.set(channel.id, playQueue)
        }
        playQueue.push(intent)
        this.updatePlaybackQueue(channel.id)
    }

    private updateAllPlaybackQueues(): void {
        this.pendingPlayback.forEach((queue, chanId) => {
            if (queue.length === 0) {
                return
            } else {
                this.updatePlaybackQueue(chanId)
            }
        })
    }

    private updatePlaybackQueue(chanId: string): void {
        const queue = this.pendingPlayback.get(chanId)
        if (!queue) {
            return
        }
        const top = queue[0]
        if (top.state === VoicePlaybackStatus.Waiting) {
            if (!top.channel.connection) {
                top.state = VoicePlaybackStatus.Connecting
                top.channel.join().then(conn => {
                    top.connection = conn
                    this.updatePlaybackQueue(chanId)
                }).catch(() => {
                    // Connection failed, just kill everything with fire
                    // console.error("Discord voice connection failed:")
                    // console.error(error)
                    top.channel.leave()
                    this.pendingPlayback.set(chanId, [])
                })
            } else {
                top.connection = top.channel.connection
                top.state = VoicePlaybackStatus.Connecting
                this.updatePlaybackQueue(chanId)
            }
        } else if (top.state === VoicePlaybackStatus.Connecting) {
            if (top.connection) {
                top.state = VoicePlaybackStatus.Playing
                const files = top.noise.files
                const file = files[Math.floor(Math.random() * files.length)]
                const filePath = pathForNoiseFile(file)
                let d: Discord.StreamDispatcher
                if (file.endsWith(".dat")) {
                    // Raw opus stream, play without transcoding
                    const stream = FS.createReadStream(filePath)
                    d = top.connection.playOpusStream(stream)
                    stream.on("error", console.error)
                } else if (file.endsWith(".opus")) {
                    // Standard .opus file, demux with Prism, don't transcode
                    const stream = FS.createReadStream(filePath)
                        .pipe(new Prism.OggOpusDemuxer())
                    d = top.connection.playOpusStream(stream)
                    stream.on("error", console.error)
                } else {
                    d = top.connection.playFile(filePath)
                }
                d.on("error", console.error)
                d.on("debug", console.log)
                d.on("end", () => {
                    top.state = VoicePlaybackStatus.Finished
                    this.updatePlaybackQueue(chanId)
                })
            }
        } else if (top.state === VoicePlaybackStatus.Playing) {
            // Ignore it, it's still playing
        } else if (top.state === VoicePlaybackStatus.Finished) {
            // Pop from the top
            queue.shift()
            if (queue.length === 0) {
                if (this.shouldLeaveChannel(top.channel)) {
                    top.channel.leave()
                } else {
                    if (top.connection) {
                        top.connection.speaking = false
                    }
                }
            } else {
                this.updatePlaybackQueue(chanId)
            }
        }
    }
}
