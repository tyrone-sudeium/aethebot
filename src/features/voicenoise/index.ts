
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
import {
    AudioPlayer,
    AudioPlayerStatus,
    AudioResource,
    VoiceConnection,
    VoiceConnectionStatus,
    createAudioResource,
    createAudioPlayer,
    StreamType,
    entersState,
    joinVoiceChannel,
} from "@discordjs/voice"
import { GlobalFeature, MessageContext } from "../feature"
import { assertIsError, log } from "../../log"
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
    connection?: VoiceConnection
}

interface PlaybackContext {
    connection: VoiceConnection
    player: AudioPlayer
    current?: VoicePlaybackIntent
}

export class VoiceNoiseFeature extends GlobalFeature {
    private pendingPlayback = new Map<string, VoicePlaybackIntent[]>()

    private context = new Map<string, PlaybackContext>()

    public handleMessage(context: MessageContext<this>): boolean {
        const tokens = this.commandTokens(context)
        const message = context.message
        const noise = this.noiseForMessage(tokens.join(" "))
        if (!noise) {
            return false
        }

        if (!message.member || !message.member.voice.channel) {
            if (noise.fallbackImageURL) {
                const embed = new Discord.EmbedBuilder()
                embed.setImage(noise.fallbackImageURL)
                context.sendReply("", [embed])
                return true
            }
            return false
        }
        const authorVoiceChannel = message.member.voice.channel
        if (authorVoiceChannel.type === Discord.ChannelType.GuildStageVoice) {
            context.sendNegativeReply("i don't support stages")
            return true
        }
        if (!authorVoiceChannel.joinable) {
            context.sendNegativeReply("can't join your channel")
            return true
        }

        this.pushPlaybackIntent(authorVoiceChannel, {
            channel: authorVoiceChannel,
            noise,
            state: VoicePlaybackStatus.Waiting,
        })

        const ctx = this.context.get(authorVoiceChannel.id)
        if (!ctx || !ctx.current) {
            this.playNextIntentOnChannel(authorVoiceChannel)
        }
        return true
    }

    public async playSound(intent: VoicePlaybackIntent): Promise<void> {
        const channel = intent.channel
        const channelId = channel.id

        const cleanup = (): void => {
            const c = this.context.get(channelId)
            if (c) {
                c.connection.destroy()
                c.player.stop()
                this.context.delete(channelId)
            }
        }

        let ctx = this.context.get(channelId)
        if (!ctx) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guildId,
                adapterCreator: channel.guild.voiceAdapterCreator,
            })
            // This is lifted STRAIGHT from the Discord.js docs. It's not my fault their type
            // definition doesn't allow your handler to return Promise<void>.
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ])
                    // Seems to be reconnecting to a new channel - ignore disconnect
                } catch (error) {
                    // Seems to be a real disconnect which SHOULDN'T be recovered from
                    cleanup()
                }
            })
            const player = createAudioPlayer()
            connection.subscribe(player)
            player.on("error", error => {
                const r = error.resource as AudioResource<{file: string}>
                log(`voicenoise: error ${error.message} with resource ${r.metadata.file}`, "always")
                cleanup()
            })
            ctx = {connection, player}
            this.context.set(channelId, ctx)
        }
        ctx.current = intent

        try {
            await entersState(ctx.connection, VoiceConnectionStatus.Ready, 5_000)
        } catch (error) {
            log(`voicenoise: connection to channel ${channelId} never became ready`, "always")
            cleanup()
            return
        }
        await this.updateDeafenStatus(channel)

        const files = intent.noise.files
        const file = files[Math.floor(Math.random() * files.length)]
        const filePath = pathForNoiseFile(file)
        const stream = FS.createReadStream(filePath)
        const audioRes = createAudioResource(stream, {inputType:  StreamType.OggOpus, metadata: {file}})
        ctx.player.play(audioRes)

        try {
            // Wait for the sample to finish playing in its entirety
            await entersState(ctx.player, AudioPlayerStatus.Playing, 5_000)
            await entersState(ctx.player, AudioPlayerStatus.Idle, 20_000)
        } catch (error) {
            assertIsError(error)
            log(`voicenoise: playback error ${error.message}`)
            cleanup()
            return
        }
        ctx.current = undefined
    }

    public async playNextIntentOnChannel(channel: Discord.VoiceChannel): Promise<void> {
        const queue = this.pendingPlayback.get(channel.id)
        if (!queue) {
            return
        }
        const intent = queue[0]
        await this.playSound(intent)

        queue.shift()
        if (queue.length === 0) {
            const ctx = this.context.get(channel.id)
            if (this.shouldLeaveChannel(intent.channel)) {
                if (ctx) {
                    ctx.connection.destroy()
                    ctx.player.stop()
                    this.context.delete(channel.id)
                }
            }
        } else {
            this.playNextIntentOnChannel(channel)
        }
    }

    public voiceChannelStateChanged(channel: Discord.VoiceChannel): void {
        if (this.shouldLeaveChannel(channel)) {
            const ctx = this.context.get(channel.id)
            if (ctx) {
                ctx.connection.destroy()
                ctx.player.stop()
                this.context.delete(channel.id)
            }
        }
    }

    private shouldLeaveChannel(channel: Discord.VoiceChannel): boolean {
        if (channel.members.size !== 1) {
            return false
        }
        if (!this.context.get(channel.id)) {
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
        // this.updatePlaybackQueue(channel.id)
    }

    // private updateAllPlaybackQueues(): void {
    //     this.pendingPlayback.forEach((queue, chanId) => {
    //         if (queue.length === 0) {
    //             return
    //         } else {
    //             this.updatePlaybackQueue(chanId)
    //         }
    //     })
    // }

    private async updateDeafenStatus(channel: Discord.VoiceChannel): Promise<void> {
        if (!this.bot.user) {
            return
        }
        const guild = channel.guild
        const state = guild.members.me?.voice
        if (!state) {
            return
        }
        if (channel.permissionsFor(this.bot.user)?.has("DeafenMembers")) {
            // Has server deafen permission. Server deafen self if not already.
            if (!state.serverDeaf) {
                await state.setDeaf(true, "AetheBot doesn't need, or want to listen to you.")
            }
        } else {
            // Doesn't have admin permission. Self deafen.
            if (!state.selfDeaf) {
                state.selfDeaf = true
            }
        }
    }

    // private updatePlaybackQueue(chanId: string): void {
    //     const queue = this.pendingPlayback.get(chanId)
    //     if (!queue) {
    //         return
    //     }
    //     const top = queue[0]
    //     if (top.state === VoicePlaybackStatus.Waiting) {
    //         if (!this.connections.get(top.channel.id)) {
    //             top.state = VoicePlaybackStatus.Connecting
    //             top.channel.join().then(conn => {
    //                 this.connections.set(top.channel.id, conn)
    //                 top.connection = conn
    //                 this.updatePlaybackQueue(chanId)
    //             }).catch(() => {
    //                 // Connection failed, just kill everything with fire
    //                 // console.error("Discord voice connection failed:")
    //                 // console.error(error)
    //                 top.channel.leave()
    //                 this.connections.delete(top.channel.id)
    //                 this.pendingPlayback.set(chanId, [])
    //             })
    //         } else {
    //             top.connection = this.connections.get(top.channel.id)
    //             top.state = VoicePlaybackStatus.Connecting
    //             this.updatePlaybackQueue(chanId)
    //         }
    //     } else if (top.state === VoicePlaybackStatus.Connecting) {
    //         if (top.connection) {
    //             top.state = VoicePlaybackStatus.Playing
    //             this.updateDeafenStatus(top.connection)
    //             const files = top.noise.files
    //             const file = files[Math.floor(Math.random() * files.length)]
    //             const filePath = pathForNoiseFile(file)
    //             let d: Discord.StreamDispatcher
    //             if (file.endsWith(".opus")) {
    //                 // Standard .opus file, demux with Prism, don't transcode
    //                 const stream = FS.createReadStream(filePath)
    //                 d = top.connection.play(stream, { type: "ogg/opus", volume: false })
    //                 stream.on("error", console.error)
    //             } else {
    //                 d = top.connection.play(filePath)
    //             }
    //             d.on("error", console.error)
    //             d.on("debug", console.log)
    //             d.on("finish", () => {
    //                 top.state = VoicePlaybackStatus.Finished
    //                 this.updatePlaybackQueue(chanId)
    //             })
    //         }
    //     } else if (top.state === VoicePlaybackStatus.Playing) {
    //         // Ignore it, it's still playing
    //     } else if (top.state === VoicePlaybackStatus.Finished) {
    //         // Pop from the top
    //         queue.shift()
    //         if (queue.length === 0) {
    //             if (this.shouldLeaveChannel(top.channel)) {
    //                 top.channel.leave()
    //                 this.connections.delete(top.channel.id)
    //             }
    //         } else {
    //             this.updatePlaybackQueue(chanId)
    //         }
    //     }
    // }
}
