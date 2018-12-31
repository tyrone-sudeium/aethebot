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
import { AdminFeature } from "./admin"
import { CountdownFeature } from "./countdown"
import { DebugFeature } from "./debug"
import { DeploymentNotificationsFeature } from "./deployment_notifications"
import { DiceFeature } from "./dice"
import { ExpandingBrainFeature } from "./expanding_brain"
import { Feature } from "./feature"
import { PingFeature } from "./ping/"
import { ReactorFeature } from "./reactor"
import { RedditVideoFeature } from "./reddit_video"
import { RegionalIndicatorFeature } from "./regional_indicator"
import { RerollFeature } from "./reroll"
import { ShitcoinFeature } from "./shitcoin"
import { TimehelperFeature } from "./timehelper"
import { VoiceNoiseFeature } from "./voicenoise/"

export { Feature }

export interface FeatureConstructor<F extends Feature> {
    new (bot: Bot, name: string): F
}

export const allFeatures: Array<FeatureConstructor<Feature>> = [
    TimehelperFeature,
    DebugFeature,
    PingFeature,
    VoiceNoiseFeature,
    CountdownFeature,
    ReactorFeature,
    RegionalIndicatorFeature,
    RerollFeature,
    ShitcoinFeature,
    DeploymentNotificationsFeature,
    DiceFeature,
    AdminFeature,
    ExpandingBrainFeature,
    RedditVideoFeature,
]
