/**
 * A drawable single tile in the expanding brain meme.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 08/06/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { Image, NodeCanvasRenderingContext2D } from "canvas"
import { Rect } from "../../util/rect"
import { Drawable } from "./drawable"

interface WrapTextResult {
    lines: string[]
    adjustedFontSize: number
}

function renderTextInRect(ctx: NodeCanvasRenderingContext2D,
                          text: string, font: string, rect: Rect, maxFontSize?: number): void {
    // start with a large font size
    let fontSize = maxFontSize || rect.height
    let res = wrappedTextAtSize(ctx, text, font, rect.width, fontSize)
    if (!res) {
        return
    }
    let { lines, adjustedFontSize } = res
    let textHeight = 0
    fontSize = adjustedFontSize + 1

    // lower the font size until the text fits the canvas
    do {
        fontSize = fontSize - 1
        res = wrappedTextAtSize(ctx, text, font, rect.width, fontSize) as WrapTextResult
        lines = res.lines
        adjustedFontSize = res.adjustedFontSize
        if (adjustedFontSize < fontSize) {
            fontSize = adjustedFontSize
        }
        ctx.font = fontSize + " " + font
        textHeight = lines.length * fontSize
    } while (textHeight > rect.height && fontSize > 8)

    // draw the text
    const textBoxHeight = fontSize * lines.length
    const topMargin = (rect.height - textBoxHeight) / 2
    let y = topMargin + rect.y
    ctx.textBaseline = "top"
    ctx.textAlign = "center"
    for (const line of lines) {
        ctx.fillText(line, rect.x + (rect.width / 2), y)
        y = y + fontSize
    }
}

function wrappedTextAtSize(ctx: NodeCanvasRenderingContext2D,
                           text: string, fontFace: string, maxWidth: number, fontSize: number): WrapTextResult | null {
    const words = text.split(" ")
    const lines = []
    let line = ""

    if (words.length < 1) {
        return null
    }

    // Handle if even the first word doesn't fit
    let fontDiff = 0
    let wordWidth = 0
    do {
        ctx.font = (fontSize - fontDiff) + "px " + fontFace
        wordWidth = ctx.measureText(words[0]).width
        fontDiff = fontDiff + 1
    } while (wordWidth > maxWidth && (fontSize - fontDiff) > 8)
    fontSize = fontSize - fontDiff - 1

    for (const word of words) {
        const testLine = line + word + " "
        const metrics = ctx.measureText(testLine)
        const testWidth = metrics.width
        if (testWidth > maxWidth) {
            if (line !== "") {
                lines.push(line)
            }
            line = word + " "
        } else {
            line = testLine
        }
    }
    lines.push(line)
    return {
        adjustedFontSize: fontSize,
        lines,
    }
}

export class MemeTile implements Drawable {
    public text: string
    public image: Image
    public width: number

    public get height(): number {
        const ratio = this.image.height / this.image.width
        return (this.width / 2) * ratio
    }

    public constructor(text: string, image: Image, width: number) {
        this.text = text
        this.image = image
        this.width = width
    }

    public drawInContext(ctx: NodeCanvasRenderingContext2D, offset?: {x: number; y: number}): void {
        offset = offset || {x: 0, y: 0}
        const textRect = new Rect(offset.x, offset.y, this.width / 2, this.height)
        ctx.fillStyle = "#000"
        renderTextInRect(ctx, this.text, "Arial", textRect, 36)
        ctx.drawImage(this.image, this.width / 2, offset.y, this.width / 2, this.height)
    }
}
