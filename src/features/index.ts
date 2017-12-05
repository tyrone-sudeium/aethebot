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

import { Bot } from "../bot"
import { CountdownFeature } from "./countdown"
import { DebugFeature } from "./debug"
import { Feature } from "./feature"
import { PingFeature } from "./ping"
import { ReactorFeature } from "./reactor"
import { TimehelperFeature } from "./timehelper"
import { VoiceNoiseFeature } from "./voicenoise/"

export { Feature }

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
    VoiceNoiseFeature,
    CountdownFeature,
    ReactorFeature,
]
