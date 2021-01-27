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
import { AdminFeature } from "./admin/admin"
import { AutoKimFeature } from "./autokim"
import { CountdownFeature } from "./countdown"
import { DebugFeature } from "./debug"
import { DeploymentNotificationsFeature } from "./deployment_notifications"
import { DiceFeature } from "./dice"
import { GlobalFeature, ServerFeature } from "./feature"
import { GalaxyBrainFeature } from "./memegen/galaxy_brain"
import { VinceMcMahonFeature } from "./memegen/vince"
import { PingFeature } from "./ping/"
import { ReactorFeature } from "./reactor"
import { RedditVideoFeature } from "./video/reddit_video"
import { RegionalIndicatorFeature } from "./regional_indicator"
import { RerollFeature } from "./reroll"
import { ScomoFeature } from "./scomo"
import { ServerFeaturesManager } from "./server_features"
import { ShitcoinFeature } from "./shitcoin"
import { TikTokVideoFeature } from "./video/tiktok_video"
import { TimehelperFeature } from "./timehelper"
import { UptimeFeature } from "./uptime"
import { VoiceNoiseFeature } from "./voicenoise/"
import { FashionReportFeature } from "./fashion_report"
import { TimPostFeature } from "./timpost"

export { GlobalFeature }

export type GlobalFeatureConstructor<F extends GlobalFeature> = new (bot: Bot, name: string) => F
export type ServerFeatureConstructor<F extends GlobalFeature> = new (bot: Bot, name: string, server: Discord.Guild) => F
export type GlobalFeatureLoader = (bot: Bot) => GlobalFeature
export type ServerFeatureLoader = (bot: Bot, server: Discord.Guild) => ServerFeature

export const allFeatures: GlobalFeatureConstructor<GlobalFeature>[] = [
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
    GalaxyBrainFeature,
    VinceMcMahonFeature,
    ScomoFeature,
    UptimeFeature,
    FashionReportFeature,
]

export const allServerFeatures: ServerFeatureConstructor<ServerFeature>[] = [
    AutoKimFeature,
    ReactorFeature,
    RedditVideoFeature,
    TikTokVideoFeature,
    TimPostFeature,
]
