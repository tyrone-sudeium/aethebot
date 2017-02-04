/**
 * Abstract robot capability.
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
import {Feature} from "./feature"
import {TimehelperFeature} from "./timehelper"
import {DebugFeature} from "./debug"
import {PingFeature} from "./ping"

export {Feature}

interface FeatureConstructor {
    new (botUser: Discord.User): Feature
}

export function createFeature(ctor: FeatureConstructor, botUser: Discord.User): Feature {
    return new ctor(botUser)
}

export const allFeatures: FeatureConstructor[] = [
    TimehelperFeature,
    DebugFeature,
    PingFeature
]
