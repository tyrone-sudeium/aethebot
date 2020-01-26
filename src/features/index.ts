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
import { Bot } from "../bot"
import { AdminFeature } from "./admin"
import { AutoKimFeature } from "./autokim"
import { CountdownFeature } from "./countdown"
import { DebugFeature } from "./debug"
import { DeploymentNotificationsFeature } from "./deployment_notifications"
import { DiceFeature } from "./dice"
import { ExpandingBrainFeature } from "./expanding_brain"
import { GlobalFeature, ServerFeature } from "./feature"
import { PingFeature } from "./ping/"
import { ReactorFeature } from "./reactor"
import { RedditVideoFeature } from "./reddit_video"
import { RegionalIndicatorFeature } from "./regional_indicator"
import { RerollFeature } from "./reroll"
import { ScomoFeature } from "./scomo"
import { ServerFeaturesManager } from "./server_features"
import { ShitcoinFeature } from "./shitcoin"
import { TimehelperFeature } from "./timehelper"
import { UptimeFeature } from "./uptime"
import { VoiceNoiseFeature } from "./voicenoise/"

export { GlobalFeature }

export type GlobalFeatureConstructor<F extends GlobalFeature> = new (bot: Bot, name: string) => F
export type ServerFeatureConstructor<F extends GlobalFeature> = new (bot: Bot, name: string, server: Discord.Guild) => F

export const allFeatures: Array<GlobalFeatureConstructor<GlobalFeature>> = [
    TimehelperFeature,
    DebugFeature,
    PingFeature,
    VoiceNoiseFeature,
    CountdownFeature,
    RegionalIndicatorFeature,
    RerollFeature,
    ServerFeaturesManager,
    ShitcoinFeature,
    DeploymentNotificationsFeature,
    DiceFeature,
    AdminFeature,
    ExpandingBrainFeature,
    ScomoFeature,
    UptimeFeature,
]

export const allServerFeatures: Array<ServerFeatureConstructor<ServerFeature>> = [
    AutoKimFeature,
    ReactorFeature,
    RedditVideoFeature,
]
