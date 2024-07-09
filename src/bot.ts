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

import assert from "assert"
import * as Discord from "discord.js"
import { GatewayIntentBits } from "discord.js"
import { Brain } from "./brain"
import { GlobalFeature, GlobalFeatureConstructor, GlobalFeatureLoader } from "./features"
import { FeatureBase, MessageContext, SlashCommand } from "./features/feature"
import { UptimeFeature } from "./features/uptime"
import { log } from "./log"
import { queryStringFromObject } from "./util/http"

export class Bot {
    public brain: Brain
    public user: Discord.ClientUser | null = null
    public token: string
    public features: GlobalFeatureConstructor<GlobalFeature>[] = []
    private loadedFeatures: Map<string, GlobalFeature> = new Map()
    private client: Discord.Client
    private customFeatureLoaders: GlobalFeatureLoader[] = []
    private connectionCheckTimer?: NodeJS.Timer

    public constructor(token: string, brain: Brain) {
        this.token = token
        this.client = this.makeClient()
        this.brain = brain
        brain.systemMessages.on("reconnect", this.reconnect.bind(this))
    }

    public addFeature(loader: GlobalFeatureLoader): void {
        this.customFeatureLoaders.push(loader)
    }

    public reconnect(): void {
        log("reconnecting to discord")
        this.client.destroy()
        this.client = this.makeClient()
        this.login()
        const uptimeFeat = this.loadedFeatureForName("UptimeFeature")
        if (uptimeFeat) {
            (uptimeFeat as UptimeFeature).setStartTime(new Date().getTime())
        }
    }

    public get applicationId(): string {
        assert(this.client.isReady())
        return this.client.application.id
    }

    public login(): void {
        this.client.login(this.token)
    }

    public fetchUser(id: string): Promise<Discord.User> {
        return this.client.users.fetch(id)
    }

    // Returns a Discord channel for the given ID, or null if that channel is
    // now unavailable for whatever reason
    // Todo: god damn this API sucks, this should really be a promise like
    // fetchUser above...
    public fetchChannel(id: string): Discord.Channel | null {
        return this.client.channels.cache.get(id) || null
    }

    public joinedServers(): Discord.Collection<string, Discord.Guild> {
        return this.client.guilds.cache
    }

    public loadedFeatureForCtor<F extends GlobalFeature>(ctor: GlobalFeatureConstructor<F>): F | null {
        for (const [, feature] of this.loadedFeatures) {
            if (feature instanceof ctor) {
                return feature
            }
        }
        return null
    }

    public loadedFeatureForName<F extends GlobalFeature>(name: string): F | null {
        return this.loadedFeatures.get(name) as F || null
    }

    public getAllSlashCommands(): SlashCommand[] {
        const slashCommands: SlashCommand[] = []
        for (const FeatureCtor of this.features) {
            const FeatureClass = FeatureCtor as typeof FeatureBase
            if (!FeatureClass.slashCommands) {
                continue
            }
            slashCommands.push(...FeatureClass.slashCommands)
        }
        return slashCommands
    }

    private makeClient(): Discord.Client {
        const client = new Discord.Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.MessageContent,
            ],
            partials: [Discord.Partials.Message, Discord.Partials.Reaction, Discord.Partials.Channel],
        })

        client.on("messageCreate", this.receiveMessage.bind(this))
        client.on("messageReactionAdd", this.onMessageReactionAdd.bind(this))
        client.on("messageReactionRemove", this.onMessageReactionRemove.bind(this))

        client.on("ready", () => {
            assert(this.client.application)
            this.user = this.client.user
            if (process.env.NODE_ENV !== "production") {
                const query = queryStringFromObject({
                    // This is a query parameter, eslint, fucking relax
                    // eslint-disable-next-line quote-props
                    "client_id": this.client.application.id,
                    scope: "bot applications.commands",
                    permissions: "0",
                })
                const url = `https://discordapp.com/oauth2/authorize?${query}`
                log(`Join this bot to servers at ${url}`)
            }
            this.loadFeatures()
        })

        client.on("voiceStateUpdate", this.voiceStateUpdate.bind(this))
        client.on(Discord.Events.Error, error => {
            log(`Discord.js error: ${error}`, "always")
        })
        client.on(Discord.Events.Warn, w => {
            log(`Discord.js warn: ${w}`, "always")
        })
        client.on(Discord.Events.Invalidated, () => {
            log("Discord.js session invalidated!", "always")
            this.reconnect()
        })

        client.on(Discord.Events.InteractionCreate, this.onInteractionCreate.bind(this))

        if (this.connectionCheckTimer) {
            clearInterval(this.connectionCheckTimer)
        }

        this.connectionCheckTimer = setInterval(() => {
            client.ws.shards.each(sh => {
                const current = new Date().getTime()
                if (sh.status !== Discord.Status.Ready && current - sh.lastPingTimestamp > 60000) {
                    log("ws not ready in over 60 seconds! restarting...", "always")
                    this.reconnect()
                }
            })
        }, 10000)
        return client
    }

    private loadFeatures(): void {
        if (!this.features || this.features.length === 0) {
            log("warn: No features loaded!")
            return
        }

        this.loadedFeatures = new Map()
        for (const FeatureCtor of this.features) {
            const feature = new FeatureCtor(this, FeatureCtor.name)
            this.loadedFeatures.set(FeatureCtor.name, feature)
        }

        for (const loader of this.customFeatureLoaders) {
            const feature = loader(this)
            this.loadedFeatures.set(feature.name, feature)
        }
    }

    private receiveMessage(msg: Discord.Message): void {
        for (const [, feature] of this.loadedFeatures) {
            const context = new MessageContext(msg, feature)
            if (feature.handlesMessage(context)) {
                feature.handleMessage(context)
            }
        }
    }

    private onInteractionCreate(interaction: Discord.Interaction<Discord.CacheType>): void {
        if (!interaction.isCommand() && !interaction.isAutocomplete()) {
            return
        }

        for (const FeatureCtor of this.features) {
            const FeatureClass = FeatureCtor as typeof FeatureBase
            if (!FeatureClass.slashCommands) {
                continue
            }

            const slashCommand = FeatureClass.slashCommands.find(s => s.name === interaction.commandName)
            if (!slashCommand) {
                continue
            }

            const feature = this.loadedFeatures.get(FeatureClass.name)
            if (!feature) {
                // Feature isn't loaded by this bot. Ignore the interaction.
                return
            }

            assert(feature.handleInteraction !== undefined)
            feature.handleInteraction(interaction)
            return
        }
    }

    private onMessageReactionAdd(msg: Discord.MessageReaction | Discord.PartialMessageReaction,
                                 user: Discord.User | Discord.PartialUser): void {
        for (const [, feature] of this.loadedFeatures) {
            if (feature.onMessageReactionAdd !== undefined) {
                feature.onMessageReactionAdd(msg, user)
            }
        }
    }

    private onMessageReactionRemove(msg: Discord.MessageReaction | Discord.PartialMessageReaction,
                                    user: Discord.User | Discord.PartialUser): void {
        for (const [, feature] of this.loadedFeatures) {
            if (feature.onMessageReactionRemove !== undefined) {
                feature.onMessageReactionRemove(msg, user)
            }
        }
    }

    private voiceStateUpdate(oldState: Discord.VoiceState, newState: Discord.VoiceState): void {
        const newUserChannel: Discord.VoiceBasedChannel | null = newState.channel
        const oldUserChannel: Discord.VoiceBasedChannel | null = oldState.channel
        const updatedChannel = newUserChannel || oldUserChannel || null

        if (!updatedChannel) {
            return
        }

        for (const [, feature] of this.loadedFeatures) {
            if (feature.voiceChannelStateChanged) {
                feature.voiceChannelStateChanged(updatedChannel)
            }
        }
    }
}
