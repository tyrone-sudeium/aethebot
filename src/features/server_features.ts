/**
 * Manage features that are scoped to individual servers.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 22/01/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import { Bot } from "../bot"
import { allServerFeatures, ServerFeatureConstructor } from "../features"
import { User } from "../model/user"
import { isNotNullary } from "../util/predicates"
import { GlobalFeature, MessageContext, ServerFeature } from "./feature"

const BRAIN_KEYS = {
    FEATURES: "sf:features",
}

type Ctor = ServerFeatureConstructor<ServerFeature>

const featureConstructors: Map<string, Ctor> = new Map()

const ADD_KEYWORDS = ["add", "install", "start"]
const REM_KEYWORDS = ["remove", "delete", "uninstall", "stop"]

export class ServerFeaturesManager extends GlobalFeature {
    private features: Map<string, ServerFeature[]> = new Map()

    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.setupFeatures()
    }

    public handlesMessage(context: MessageContext<this>): boolean {
        return true
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const message = context.message
        const isDM = message.channel.type === "dm"
        if (!isDM) {
            const features = this.features.get(message.guild.id)
            if (features) {
                for (const feature of features) {
                    const featuresContext = new MessageContext(message, feature)
                    if (feature.handlesMessage(featuresContext)) {
                        feature.handleMessage(featuresContext)
                    }
                }
            }
        }

        const tokens = this.commandTokens(context)
        const lowerTokens = tokens.map((t) => t.toLowerCase())
        if (tokens.length < 2) {
            return false
        }
        if (lowerTokens[1] !== "feature") {
            return false
        }

        if (!ADD_KEYWORDS.concat(REM_KEYWORDS).includes(lowerTokens[0])) {
            return false
        }
        if (tokens.length < 3) {
            context.sendNegativeReply()
            return false
        }
        if (isDM && tokens.length < 4) {
            context.sendNegativeReply("i need a server id: `[add|remove] feature <featureName> <serverId>`")
            return false
        }

        const ctor = featureConstructors.get(tokens[2]) || featureConstructors.get(`${tokens[2]}Feature`)
        if (!ctor) {
            context.sendNegativeReply(`don't know what "${tokens[2]}" is...`)
            return false
        }

        this.asyncHandler(context, tokens, ctor)

        return true
    }

    public onMessageReactionAdd(reaction: Discord.MessageReaction): boolean {
        let handled = false
        const features = this.features.get(reaction.message.guild.id)
        if (features) {
            for (const feature of features) {
                if (feature.onMessageReactionAdd !== undefined) {
                    const res = feature.onMessageReactionAdd(reaction)
                    handled = handled || res
                }
            }
        }
        return handled
    }

    private async setupFeatures() {
        if (featureConstructors.size === 0) {
            for (const ctor of allServerFeatures) {
                featureConstructors.set(ctor.name, ctor)
            }
        }
        const storedStr = await this.bot.brain.get(BRAIN_KEYS.FEATURES)
        let storedJson: {[serverId: string]: string[]} = {}
        try {
            if (storedStr) {
                storedJson = JSON.parse(storedStr)
            }
        } catch {
            storedJson = {}
        }
        for (const [serverId, discordServer] of this.bot.joinedServers()) {
            const featureNames = storedJson[serverId]
            if (featureNames) {
                const loadedFeatures: ServerFeature[] = featureNames.map((name) => {
                    const ctor = featureConstructors.get(name)
                    if (!ctor) {
                        return null
                    }
                    return new ctor(this.bot, name, discordServer)
                }).filter(isNotNullary)
                this.features.set(serverId, loadedFeatures)
            } else {
                this.features.set(serverId, [])
            }
        }
    }

    private async asyncHandler(context: MessageContext<this>, tokens: string[], ctor: Ctor): Promise<void> {
        const isDM = context.message.channel.type === "dm"

        const ok = await this.validatePermission(context)
        if (!ok) {
            return
        }
        let server: Discord.Guild
        if (isDM) {
            const serverId = tokens[3].toLowerCase()
            const potentialServer = this.bot.joinedServers().get(serverId)
            if (!potentialServer) {
                context.sendNegativeReply(`${serverId} is either an invalid server id or I'm not joined to it`)
                return
            }
            server = potentialServer
        } else {
            server = context.message.guild
        }

        if (ADD_KEYWORDS.includes(tokens[0].toLowerCase())) {
            await this.addFeature(ctor, server, context)
        } else if (REM_KEYWORDS.includes(tokens[0].toLowerCase())) {
            await this.removeFeature(ctor, server, context)
        }
    }

    private async validatePermission(context: MessageContext<this>): Promise<boolean> {
        const user = new User(this.bot, context.message.author.id)
        await user.load()
        if (!user.isAdmin) {
            context.sendNegativeReply("you are not an admin")
            return false
        }
        return true
    }

    private async saveToBrain() {
        const obj: {[serverId: string]: string[]} = Object.create(null)
        for (const [serverId, features] of this.features) {
            obj[serverId] = features.map((f) => f.name)
        }
        this.bot.brain.set(BRAIN_KEYS.FEATURES, JSON.stringify(obj))
    }

    private async addFeature(ctor: Ctor, server: Discord.Guild, context: MessageContext<this>) {
        let featuresForServer = this.features.get(server.id)
        if (!featuresForServer) {
            featuresForServer = []
            this.features.set(server.id, featuresForServer)
        }
        if (featuresForServer.find((f) => f.name === ctor.name)) {
            context.sendNegativeReply("feature already active")
            return
        }
        featuresForServer.push(new ctor(this.bot, ctor.name, server))
        context.sendReply("ok")
        this.saveToBrain()
    }

    private async removeFeature(ctor: Ctor, server: Discord.Guild, context: MessageContext<this>) {
        let featuresForServer = this.features.get(server.id)
        if (!featuresForServer) {
            featuresForServer = []
            this.features.set(server.id, featuresForServer)
        }
        if (!featuresForServer.find((f) => f.name === ctor.name)) {
            context.sendNegativeReply("feature not active")
            return
        }
        featuresForServer = featuresForServer.filter((f) => f.name !== ctor.name)
        this.features.set(server.id, featuresForServer)
        context.sendReply("ok")
        this.saveToBrain()
    }
}
