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
import {Feature} from "./features"
import {Client} from "discord.js"
import * as Features from "./features"

export class Bot {
    brain: Brain
    features: Feature[]
    _client: Client

    constructor(client: Client) {
        this._client = client
    }

    loadFeatures() {
        this.features = []
        for(const FeatureClass of Features.allFeatures) {
            const feature = new FeatureClass()
            this.features.push(feature)
        }
    }
}
