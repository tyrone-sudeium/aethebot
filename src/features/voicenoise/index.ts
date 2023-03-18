
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
import assert from "assert"
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
import { GlobalFeature, MessageContext, SlashCommand } from "../feature"
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
    public static slashCommands?: SlashCommand[] | undefined = [
        new Discord.SlashCommandBuilder()
            .setName("noise")
            .setDescription("Be super annoying or funny(?) in voice chat")
            .addStringOption(option =>
                option.setName("query")
                    .setDescription("ID of the noise or some other text that matches one.")
                    .setRequired(true)
                    .setAutocomplete(true))
        ,
    ]

    private pendingPlayback = new Map<string, VoicePlaybackIntent[]>()
    private context = new Map<string, PlaybackContext>()

    public async handleInteraction(interaction: Discord.Interaction<Discord.CacheType>): Promise<void> {
        if (interaction.isAutocomplete()) {
            const focusedValue = interaction.options.getFocused()
            const choices = NOISES.filter(n => {
                if (n.desc) {
                    return n.id.includes(focusedValue.toUpperCase()) ||
                        n.desc.toUpperCase().includes(focusedValue.toUpperCase())
                } else {
                    return n.id.includes(focusedValue.toUpperCase())
                }
            })
            choices.splice(25)
            await interaction.respond(choices.map(n => ({name: n.desc ?? n.id, value: n.id})))
            return
        }
        if (!interaction.isChatInputCommand()) {
            return
        }
        const query = interaction.options.getString("query")
        if (!query) {
            // This is required? lul.
            await interaction.reply({content: "⚠️ Missing query. Try `/noise [noise ID]`", ephemeral: true})
            return
        }
        let noise: Noise | undefined = NOISES.find(n => n.id === query?.toUpperCase())
        if (!noise) {
            noise = this.noiseForMessage(query)
        }
        if (!noise) {
            await interaction.reply({content: `⚠️ No noises match "${query}".`, ephemeral: true})
            return
        }

        const author = interaction.member
        assert(author !== null)
        const guild = interaction.guild
        if(!guild) {
            return
        }
        const member = await guild.members.fetch(author.user.id)
        const authorVoiceChannel = member.voice.channel
        if (!authorVoiceChannel) {
            if (noise.fallbackImageURL) {
                await interaction.reply({embeds: [new Discord.EmbedBuilder().setImage(noise.fallbackImageURL)]})
            } else {
                await interaction.reply({content: "⚠️ Join a voice channel first.", ephemeral: true})
            }
            return
        }
        if (authorVoiceChannel.type === Discord.ChannelType.GuildStageVoice) {
            await interaction.reply({content: "⚠️ I don't support stages.", ephemeral: true})
            return
        }
        if (!authorVoiceChannel.joinable) {
            await interaction.reply({content: "⚠️ I don't have permission to join your channel", ephemeral: true})
            return
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
        await interaction.reply({content: "✅ OK.", ephemeral: true})
    }

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
                c.connection.removeAllListeners()
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
                    log(`voicenoise: ${channelId} disconnected`, "always")
                    cleanup()
                }
            })
            connection.on(VoiceConnectionStatus.Destroyed, () => log(`voicenoise: ${channelId} destroyed`, "always"))
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
            const st = ctx.connection.state.status
            log(`voicenoise: connection to channel ${channelId} (${st}) never became ready`, "always")
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
                    ctx.connection.removeAllListeners()
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

    private noiseForMessage(message: string): Noise | undefined {
        for (const noise of NOISES) {
            if (noise.regex.find(r => r.test(message))) {
                return noise
            }
        }
        return undefined
    }

    private pushPlaybackIntent(channel: Discord.VoiceChannel,
                               intent: VoicePlaybackIntent): void {
        let playQueue = this.pendingPlayback.get(channel.id)
        if (!playQueue) {
            playQueue = []
            this.pendingPlayback.set(channel.id, playQueue)
        }
        playQueue.push(intent)
    }

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
}
