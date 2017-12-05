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
import { Brain } from "./brain"
import { createFeature, Feature } from "./features"
import * as Features from "./features"
import { log } from "./log"

export class Bot {
    public brain: Brain
    public user: Discord.ClientUser
    public token: string
    private features: Feature[]
    private client: Discord.Client

    constructor(token: string) {
        this.token = token
        this.client = this.makeClient()
    }

    public reconnect() {
        log("reconnecting to discord")
        const client = this.client
        this.client = null
        client.destroy().then(() => {
            this.client = this.makeClient()
            this.login()
        }).catch(console.error)
    }

    public login() {
        this.client.login(this.token)
    }

    private makeClient() {
        const client = new Discord.Client()
        client.on("message", this.receiveMessage.bind(this))
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
        return client
    }

    private loadFeatures() {
        this.features = []
        for (const FeatureClass of Features.allFeatures) {
            const feature = createFeature(FeatureClass, this)
            this.features.push(feature)
        }
    }

    private receiveMessage(msg: Discord.Message) {
        for (const feature of this.features) {
            if (feature.handlesMessage(msg)) {
                feature.handleMessage(msg)
            }
        }
    }
}
