/**
 * Vince McMahon animated reaction meme generator.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 30/01/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { createCanvas, Image, loadImage } from "canvas"
import * as Discord from "discord.js"
import * as Path from "path"
import { log } from "../../log"
import { removeBotMentions } from "../../util/remove_mentions"
import { GlobalFeature, MessageContext } from "../feature"
import { Drawable } from "./drawable"
import { MemeTile } from "./meme_tile"
import { Separator } from "./separator"

import GIFEncoder = require("gif-encoder-2")
const WIDTH = 480
const TILE_HEIGHT = 194
const SEPARATOR_HEIGHT = 3
const NUM_FRAMES = 15 // 1-indexed
const TRIGGERS = [
    "vince",
]

export class VinceMcMahonFeature extends GlobalFeature {
    public handlesMessage(context: MessageContext<this>): boolean {
        if (!super.handlesMessage(context)) {
            return false
        }
        const content = removeBotMentions(this.bot, context.message)
        const lines = content.split("\n")
        if (lines.length > 0 && TRIGGERS.indexOf(lines[0].trim().toLowerCase()) !== -1) {
            return true
        }

        return false
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const content = removeBotMentions(this.bot, context.message)
        const lines = content.split("\n").splice(1)
        if (lines.length === 0) {
            context.sendNegativeReply("supply each vince panel text on its own line")
            return false
        }
        if (lines.length > 6) {
            context.sendNegativeReply("meme too stronk, maximum of 6 panels")
            return false
        }

        this.replyMeme(lines, context.message)
        return true
    }

    private async replyMeme(lines: string[], message: Discord.Message): Promise<void> {
        const totalHeight = (TILE_HEIGHT * lines.length) + (SEPARATOR_HEIGHT * (lines.length - 1))
        const gif = new GIFEncoder(WIDTH, totalHeight, "octree", true, NUM_FRAMES)
        gif.setFrameRate(15)
        gif.start()
        for (let frame = 1; frame <= NUM_FRAMES; frame = frame + 1) {
            const images = await this.loadImages(lines.length, frame)
            const tiles = images.map((img, idx) => new MemeTile(lines[idx], img, WIDTH))
            let drawables: Drawable[] = []
            drawables = drawables.concat(...tiles.map((t) => [new Separator(WIDTH, SEPARATOR_HEIGHT), t])).slice(1)
            const canvas = createCanvas(WIDTH, totalHeight)
            const ctx = canvas.getContext("2d")
            if (!ctx) {
                return
            }
            ctx.fillStyle = "#fff"
            ctx.fillRect(0, 0, WIDTH, totalHeight)
            let y = 0
            for (const drawable of drawables) {
                const offset = {x: 0, y}
                drawable.drawInContext(ctx, offset)
                y = y + drawable.height
            }
            gif.addFrame(ctx)
        }
        gif.finish()
        const attachment = gif.out.getData()
        log(`gif size: ${attachment.length}`)
        const msgOptions: Discord.MessageOptions = {
            files: [
                {
                    attachment,
                    name: "meme.gif",
                },
            ],
        }
        if (message.channel.type === "dm") {
            await message.channel.send(msgOptions)
        } else {
            await message.channel.send(`<@${message.author.id}>`, msgOptions)
        }
    }

    private async loadImages(panels: number, frame: number): Promise<Image[]> {
        // When there's 2 or 3 or images, always use 6/*.jpg as the last panel
        const imagePaths: string[][] = [...Array(6).keys()].map((i) => [`${i + 1}`, `${frame}.jpg`])
        // Remove middle panels until we get to the count
        while (imagePaths.length > panels) {
            imagePaths.splice(Math.floor(imagePaths.length / 2), 1)
        }
        const images: Image[] = []
        for (const imagePath of imagePaths) {
            const path = Path.join(process.cwd(), "res", "vince", imagePath[0], imagePath[1])
            images.push(await loadImage(path))
        }
        return images
    }
}
