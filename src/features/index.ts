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

import {Bot} from "../bot"
import {Feature} from "./feature"
import {TimehelperFeature} from "./timehelper"
import {DebugFeature} from "./debug"
import {PingFeature} from "./ping"
import {VoiceNoiseFeature} from "./voicenoise"

export {Feature}

interface FeatureConstructor {
    new (bot: Bot): Feature
}

export function createFeature(ctor: FeatureConstructor, bot: Bot): Feature {
    return new ctor(bot)
}

export const allFeatures: FeatureConstructor[] = [
    TimehelperFeature,
    DebugFeature,
    PingFeature,
    VoiceNoiseFeature
]
