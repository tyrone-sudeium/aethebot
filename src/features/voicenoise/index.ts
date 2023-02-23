
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

    // Map of Voice CHANNEL id to VoiceConnection
    private connections = new Map<string, Discord.VoiceConnection>()

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        const message = context.message
        const noise = this.noiseForMessage(tokens.join(" "))
        if (!noise) {
            return false
        }

        if (!message.member || !message.member.voice.channel) {
            if (noise.fallbackImageURL) {
                const embed = new Discord.MessageEmbed()
                embed.setImage(noise.fallbackImageURL)
                message.channel.send(embed)
                return true
            }
            return false
        }
        const authorVoiceChannel = message.member.voice.channel
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
            this.connections.delete(channel.id)
        }
    }

    private shouldLeaveChannel(channel: Discord.VoiceChannel): boolean {
        if (channel.members.size !== 1) {
            return false
        }
        if (!this.connections.get(channel.id)) {
            return false
        }
        const botUser = this.bot.user
        if (!botUser) {
            return false
        }
        const lastUser = channel.members.last()
        if (lastUser && lastUser.user.equals(botUser)) {
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

    private async updateDeafenStatus(connection: Discord.VoiceConnection): Promise<void> {
        if (!this.bot.user) {
            return
        }
        if (connection.channel.permissionsFor(this.bot.user)?.has("DEAFEN_MEMBERS")) {
            // Has server deafen permission. Server deafen self if not already.
            if (!connection.voice.serverDeaf) {
                await connection.voice.setDeaf(true, "AetheBot doesn't need, or want to listen to you.")
            }
        } else {
            // Doesn't have admin permission. Self deafen.
            if (!connection.voice.selfDeaf) {
                await connection.voice.setSelfDeaf(true)
            }
        }
    }

    private updatePlaybackQueue(chanId: string): void {
        const queue = this.pendingPlayback.get(chanId)
        if (!queue) {
            return
        }
        const top = queue[0]
        if (top.state === VoicePlaybackStatus.Waiting) {
            if (!this.connections.get(top.channel.id)) {
                top.state = VoicePlaybackStatus.Connecting
                top.channel.join().then(conn => {
                    this.connections.set(top.channel.id, conn)
                    top.connection = conn
                    this.updatePlaybackQueue(chanId)
                }).catch(() => {
                    // Connection failed, just kill everything with fire
                    // console.error("Discord voice connection failed:")
                    // console.error(error)
                    top.channel.leave()
                    this.connections.delete(top.channel.id)
                    this.pendingPlayback.set(chanId, [])
                })
            } else {
                top.connection = this.connections.get(top.channel.id)
                top.state = VoicePlaybackStatus.Connecting
                this.updatePlaybackQueue(chanId)
            }
        } else if (top.state === VoicePlaybackStatus.Connecting) {
            if (top.connection) {
                top.state = VoicePlaybackStatus.Playing
                this.updateDeafenStatus(top.connection)
                const files = top.noise.files
                const file = files[Math.floor(Math.random() * files.length)]
                const filePath = pathForNoiseFile(file)
                let d: Discord.StreamDispatcher
                if (file.endsWith(".opus")) {
                    // Standard .opus file, demux with Prism, don't transcode
                    const stream = FS.createReadStream(filePath)
                    d = top.connection.play(stream, { type: "ogg/opus", volume: false })
                    stream.on("error", console.error)
                } else {
                    d = top.connection.play(filePath)
                }
                d.on("error", console.error)
                d.on("debug", console.log)
                d.on("finish", () => {
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
                    this.connections.delete(top.channel.id)
                }
            } else {
                this.updatePlaybackQueue(chanId)
            }
        }
    }
}
