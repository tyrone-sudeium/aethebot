/**
 * Expanding brain / galaxy brain / brain meme.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 08/06/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Path from "path"
import { createCanvas, Image, loadImage } from "@napi-rs/canvas"
import { removeBotMentions } from "../../util/remove_mentions"
import { GlobalFeature, MessageContext } from "../feature"
import { log } from "../../log"
import { Drawable } from "./drawable"
import { MemeTile } from "./meme_tile"
import { Separator } from "./separator"

const WIDTH = 600
const SEPARATOR_HEIGHT = 3
const TRIGGERS = [
    "galaxy brain",
    "expanding brain",
    "brain meme",
]

export class GalaxyBrainFeature extends GlobalFeature {
    public handlesMessage(context: MessageContext<this>): boolean {
        if (!super.handlesMessage(context)) {
            return false
        }

        const content = removeBotMentions(this.bot, context.message)
        const lines = content.split("\n")
        if (lines.length > 0 && TRIGGERS.includes(lines[0].trim().toLowerCase())) {
            return true
        }

        return false
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const content = removeBotMentions(this.bot, context.message)
        const lines = content.split("\n").splice(1)
        if (lines.length === 0) {
            context.sendNegativeReply("supply each brain panel text on its own line")
            return false
        }
        if (lines.length > 9) {
            context.sendNegativeReply("meme too stronk, maximum of 9 panels")
            return false
        }

        this.replyMeme(lines, context)
        return true
    }

    public async generateMeme(lines: string[]): Promise<Buffer | undefined> {
        const images = await this.loadImages(lines.length)
        const tiles = images.map((img, idx) => new MemeTile(lines[idx], img, WIDTH))
        let drawables: Drawable[] = []
        drawables = drawables.concat(...tiles.map(t => [new Separator(WIDTH, SEPARATOR_HEIGHT), t])).slice(1)
        const totalHeight = drawables.reduce(((acc, drawable) => acc + drawable.height), 0)
        const canvas = createCanvas(WIDTH, totalHeight)
        const ctx = canvas.getContext("2d")
        if (!ctx) {
            log("couldn't create canvas context", "always")
            return undefined
        }

        ctx.fillStyle = "#fff"
        ctx.fillRect(0, 0, WIDTH, totalHeight)
        let y = 0
        for (const drawable of drawables) {
            const offset = {x: 0, y}
            drawable.drawInContext(ctx, offset)
            y = y + drawable.height
        }
        return canvas.toBuffer("image/png")
    }

    private async replyMeme(lines: string[], context: MessageContext<this>): Promise<void> {
        const attachment = await this.generateMeme(lines)
        if (!attachment) {
            context.sendNegativeReply("something's cooked, check the logs")
            return
        }
        await context.sendReplyFiles(undefined, [{data: attachment, name: "meme.png"}])
    }

    private async loadImages(count: number): Promise<Image[]> {
        // When there's 2 or 3 or images, always use 3.jpg as the last panel
        let imageNames: string[] = []
        if (count === 2) {
            imageNames = ["0.jpg", "3.jpg"]
        } else if (count === 3) {
            imageNames = ["0.jpg", "1.jpg", "3.jpg"]
        } else {
            imageNames = [...Array(count).keys()].map(i => `${i}.jpg`)
        }

        const images: Image[] = []
        for (const imageName of imageNames) {
            const path = Path.join(process.cwd(), "res", "expanding_brain", imageName)
            images.push(await loadImage(path))
        }
        return images
    }
}
