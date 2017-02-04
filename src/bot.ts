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

import {Brain} from "./brain"
import {Feature, createFeature} from "./features"
import * as Discord from "discord.js"
import * as Features from "./features"

export class Bot {
    brain: Brain
    user: Discord.ClientUser
    private _features: Feature[]
    private _client: Discord.Client

    constructor(client: Discord.Client) {
        this._client = client
        client.on("message", this._receiveMessage.bind(this))
        client.on("ready", () => {
            this.user = this._client.user
            this._loadFeatures()
        })
    }

    private _loadFeatures() {
        this._features = []
        for (const FeatureClass of Features.allFeatures) {
            const feature = createFeature(FeatureClass, this)
            this._features.push(feature)
        }
    }

    private _receiveMessage(msg: Discord.Message) {
        for (const feature of this._features) {
            feature.handleMessage(msg)
        }
    }
}
