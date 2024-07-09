/**
 * Vince McMahon animated reaction meme generator (worker thread).
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 30/01/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as OS from "os"
import * as Path from "path"
import * as NodeWorker from "node:worker_threads"
import { createCanvas, Image, loadImage } from "@napi-rs/canvas"
import { GIFEncoder } from "@tyrone-sudeium/napi-gif-encoder"
import { Drawable } from "../features/memegen/drawable"
import { MemeTile } from "../features/memegen/meme_tile"
import { Separator } from "../features/memegen/separator"

const WIDTH = 480
const TILE_HEIGHT = 194
const SEPARATOR_HEIGHT = 3
const NUM_FRAMES = 15 // 1-indexed

interface Message {
    id: string
    lines: string[]
}

async function loadImages(panels: number, frame: number): Promise<Image[]> {
    // When there's 2 or 3 or images, always use 6/*.jpg as the last panel
    const imagePaths: string[][] = [...Array(6).keys()].map(i => [`${i + 1}`, `${frame}.jpg`])
    // Remove middle panels until we get to the count
    while (imagePaths.length > panels) {
        imagePaths.splice(Math.floor(imagePaths.length / 2), 1)
    }

    const imagePromises = imagePaths.map(imagePath => {
        const path = Path.join(process.cwd(), "res", "vince", imagePath[0], imagePath[1])
        return loadImage(path)
    })

    return Promise.all(imagePromises)
}

async function generateGif(message: Message, id: string): Promise<string> {
    const { lines } = message
    const totalHeight = (TILE_HEIGHT * lines.length) + (SEPARATOR_HEIGHT * (lines.length - 1))
    const filePath = Path.join(OS.tmpdir(), `${id}.gif`)

    const gif = new GIFEncoder(WIDTH, totalHeight, filePath)
    gif.setFrameRate(14)

    const canvas = createCanvas(WIDTH, totalHeight)
    const ctx = canvas.getContext("2d")
    if (!ctx) {
        throw new Error("couldn't make canvas")
    }

    for (let frame = 1; frame <= NUM_FRAMES; frame = frame + 1) {
        const images = await loadImages(lines.length, frame)
        const tiles = images.map((img, idx) => new MemeTile(lines[idx], img, WIDTH))
        if (frame === 1) {
            // Draw everything, including text and separators on the first frame
            let drawables: Drawable[] = []
            drawables = drawables.concat(...tiles.map(t => [new Separator(WIDTH, SEPARATOR_HEIGHT), t])).slice(1)

            ctx.fillStyle = "#fff"
            ctx.fillRect(0, 0, WIDTH, totalHeight)
            let y = 0
            for (const drawable of drawables) {
                const offset = {x: 0, y}
                drawable.drawInContext(ctx, offset)
                y = y + drawable.height
            }
        } else {
            // Only draw the images on the subsequent frames
            let y = 0
            for (const tile of tiles) {
                ctx.drawImage(tile.image, tile.width / 2, y, tile.width / 2, tile.height)
                y = y + tile.height + SEPARATOR_HEIGHT
            }
        }

        gif.addFrame(Buffer.from(ctx.getImageData(0, 0, WIDTH, totalHeight).data))
    }
    await gif.finish()
    return filePath
}


if (NodeWorker && NodeWorker.parentPort) {
    const parentPort = NodeWorker.parentPort
    NodeWorker.parentPort.on("message", value => {
        if (value && value.id && value.lines) {
            generateGif(value, value.id).then(path => {
                parentPort.postMessage({id: value.id, filePath: path})
            })
        }
    })
} else {
    onmessage = async function(ev): Promise<void> {
        const value: Message = ev.data
        if (value && value.id && value.lines) {
            const path = await generateGif(value, value.id)
            postMessage({id: value.id, filePath: path})
        }
    }
}
