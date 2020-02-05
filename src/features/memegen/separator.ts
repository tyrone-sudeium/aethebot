/**
 * Black rectangle between tiles. Yes this really needed to be its own file,
 * shut up.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 08/06/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { Drawable } from "./drawable"
import { NodeCanvasRenderingContext2D } from "canvas"

export class Separator implements Drawable {
    public width: number
    public height: number
    public color = "#000"
    public constructor(width: number, height: number) {
        this.width = width
        this.height = height
    }
    public drawInContext(ctx: NodeCanvasRenderingContext2D, offset?: {x: number; y: number}): void {
        ctx.fillStyle = this.color
        offset = offset || {x: 0, y: 0}
        ctx.fillRect(offset.x, offset.y, this.width, this.height)
    }
}
