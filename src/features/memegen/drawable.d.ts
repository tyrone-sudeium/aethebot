/**
 * Drawable things.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 08/06/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { SKRSContext2D } from "@napi-rs/canvas"

export interface Drawable {
    height: number
    width: number
    drawInContext(ctx: SKRSContext2D, offset?: {x: number; y: number}): void
}
