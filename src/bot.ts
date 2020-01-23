/**
 * The chatbot itself.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import { Brain, MemoryBrain } from "./brain"
import { GlobalFeature, GlobalFeatureConstructor } from "./features"
import * as Features from "./features"
import { UptimeFeature } from "./features/uptime"
import { log } from "./log"
import { User } from "./model/user"

export class Bot {
    public brain: Brain
    public user: Discord.ClientUser | null = null
    public token: string
    public features: Array<GlobalFeatureConstructor<GlobalFeature>> = []
    private loadedFeatures: Map<string, GlobalFeature> = new Map()
    private client: Discord.Client

    constructor(token: string, brain: Brain) {
        this.token = token
        this.client = this.makeClient()
        this.brain = brain
        brain.systemMessages.on("reconnect", this.reconnect.bind(this))
    }

    public reconnect() {
        log("reconnecting to discord")
        this.client.destroy().then(() => {
            this.client = this.makeClient()
            this.login()
            const uptimeFeat = this.loadedFeatureForName("UptimeFeature")
            if (uptimeFeat) {
                (uptimeFeat as UptimeFeature).setStartTime(new Date().getTime())
            }
        // tslint:disable-next-line:no-console
        }).catch(console.error)
    }

    public login() {
        this.client.login(this.token)
    }

    public fetchUser(id: string): Promise<Discord.User> {
        return this.client.fetchUser(id)
    }

    // Returns a Discord channel for the given ID, or null if that channel is
    // now unavailable for whatever reason
    public fetchChannel(id: string): Discord.Channel | null {
        return this.client.channels.find("id", id) || null
    }

    public joinedServers(): Discord.Collection<string, Discord.Guild> {
        return this.client.guilds
    }

    public loadedFeatureForCtor<F extends GlobalFeature>(ctor: GlobalFeatureConstructor<F>): F | null {
        for (const [_, feature] of this.loadedFeatures) {
            if (feature instanceof ctor) {
                return feature as F
            }
        }
        return null
    }

    public loadedFeatureForName<F extends GlobalFeature>(name: string): F | null {
        return this.loadedFeatures.get(name) as F || null
    }

    private makeClient() {
        const client = new Discord.Client()
        client.on("message", this.receiveMessage.bind(this))
        client.on("messageReactionAdd", this.onMessageReactionAdd.bind(this))
        client.on("ready", () => {
            this.user = this.client.user
            if (process.env.NODE_ENV !== "production") {
                this.client.fetchApplication().then((app) => {
                    log(`Join this bot to servers at ` +
                        `https://discordapp.com/oauth2/authorize?&client_id=${app.id}&scope=bot&permissions=0`)
                })
            }
            this.loadFeatures()
        })
        client.on("voiceStateUpdate", this.voiceStateUpdate.bind(this))
        client.on("error", (error) => {
            log(`Discord.js error: ${error}`)
        })
        return client
    }

    private loadFeatures() {
        if (!this.features || this.features.length === 0) {
            log("warn: No features loaded!")
            return
        }
        this.loadedFeatures = new Map()
        for (const FeatureCtor of this.features) {
            const feature = new FeatureCtor(this, FeatureCtor.name)
            this.loadedFeatures.set(FeatureCtor.name, feature)
        }
    }

    private receiveMessage(msg: Discord.Message) {
        for (const [_, feature] of this.loadedFeatures) {
            if (feature.handlesMessage(msg)) {
                feature.handleMessage(msg)
            }
        }
    }

    private onMessageReactionAdd(msg: Discord.MessageReaction) {
        for (const [_, feature] of this.loadedFeatures) {
            if (feature.onMessageReactionAdd !== undefined) {
                feature.onMessageReactionAdd(msg)
            }
        }
    }

    private voiceStateUpdate(oldMember: Discord.GuildMember, newMember: Discord.GuildMember) {
        const newUserChannel: Discord.VoiceChannel | undefined = newMember.voiceChannel
        const oldUserChannel: Discord.VoiceChannel | undefined = oldMember.voiceChannel
        const updatedChannel = newUserChannel || oldUserChannel || null

        for (const [_, feature] of this.loadedFeatures) {
            if (feature.voiceChannelStateChanged) {
                feature.voiceChannelStateChanged(updatedChannel)
            }
        }
    }
}
