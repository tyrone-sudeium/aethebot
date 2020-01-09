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

import { createCanvas, Image, loadImage } from "canvas"
import * as Discord from "discord.js"
import * as FS from "fs"
import * as Path from "path"
import { removeBotMentions } from "../../util/remove_mentions"
import { Feature } from "../feature"
import { BrainTile } from "./brain_tile"
import { Drawable } from "./drawable"
import { Separator } from "./separator"

const WIDTH = 600
const SEPARATOR_HEIGHT = 3
const TRIGGERS = [
    "galaxy brain",
    "expanding brain",
    "brain meme",
]

export class ExpandingBrainFeature extends Feature {
    public handlesMessage(message: Discord.Message): boolean {
        if (!super.handlesMessage(message)) {
            return false
        }
        const content = removeBotMentions(this.bot, message)
        const lines = content.split("\n")
        if (lines.length > 0 && TRIGGERS.indexOf(lines[0].trim().toLowerCase()) !== -1) {
            return true
        }

        return false
    }

    public handleMessage(message: Discord.Message): boolean {
        const content = removeBotMentions(this.bot, message)
        const lines = content.split("\n").splice(1)
        if (lines.length === 0) {
            this.replyNegatively(message, "supply each brain panel text on its own line")
            return false
        }
        if (lines.length > 9) {
            this.replyNegatively(message, "meme too stronk, maximum of 9 panels")
            return false
        }

        this.replyMeme(lines, message)
        return true
    }

    private async replyMeme(lines: string[], message: Discord.Message): Promise<void> {
        const images = await this.loadImages(lines.length)
        const tiles = images.map((img, idx) => new BrainTile(lines[idx], img, WIDTH))
        let drawables: Drawable[] = []
        drawables = drawables.concat(...tiles.map((t) => [new Separator(WIDTH, SEPARATOR_HEIGHT), t])).slice(1)
        const totalHeight = drawables.reduce(((acc, drawable) => acc + drawable.height), 0)
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
        const attachment = canvas.toBuffer("image/png")
        const msgOptions: Discord.MessageOptions = {
            files: [
                {
                    attachment,
                    name: "meme.png",
                },
            ],
        }
        if (message.channel.type === "dm") {
            await message.channel.send(msgOptions)
        } else {
            await message.channel.send(`<@${message.author.id}>`, msgOptions)
        }
    }

    private async loadImages(count: number): Promise<Image[]> {
        // When there's 2 or 3 or images, always use 3.jpg as the last panel
        let imageNames: string[] = []
        if (count === 2) {
            imageNames = ["0.jpg", "3.jpg"]
        } else if (count === 3) {
            imageNames = ["0.jpg", "1.jpg", "3.jpg"]
        } else {
            imageNames = [...Array(count).keys()].map((i) => `${i}.jpg`)
        }
        const images: Image[] = []
        for (const imageName of imageNames) {
            const path = Path.join(process.cwd(), "res", "expanding_brain", imageName)
            images.push(await loadImage(path))
        }
        return images
    }
}
