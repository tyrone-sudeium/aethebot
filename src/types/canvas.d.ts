/**
 * Type definition for node-canvas.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 08/06/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

/// <reference types="node" />

declare module "canvas" {
    import { Readable } from "stream"
    type CanvasType = "pdf" | "svg"

    export interface NodeCanvasRenderingContext2D extends CanvasRenderingContext2D {
        patternQuality: "fast" | "good" | "best" | "nearest" | "bilinear"
        textDrawingMode: "path" | "glyph"
        filter: "fast" | "good" | "best" | "nearest" | "bilinear"
        antialias: "default" | "none" | "gray" | "subpixel"

        drawImage(image: CanvasImageSource | Image, dstX: number, dstY: number): void
        drawImage(image: CanvasImageSource | Image, dstX: number, dstY: number, dstW: number, dstH: number): void
        drawImage(image: CanvasImageSource | Image,
            srcX: number,
            srcY: number,
            srcW: number,
            srcH: number,
            dstX: number,
            dstY: number,
            dstW: number,
            dstH: number
        ): void
    }

    export interface Canvas {
        readonly PNG_NO_FILTERS: number
        readonly PNG_FILTER_NONE: number
        readonly PNG_FILTER_SUB: number
        readonly PNG_FILTER_UP: number
        readonly PNG_FILTER_AVG: number
        readonly PNG_FILTER_PAETH: number
        readonly PNG_ALL_FILTERS: number

        getContext(contextId: "2d",
            contextAttributes?: CanvasRenderingContext2DSettings
        ): NodeCanvasRenderingContext2D | null

        toBuffer(type: "raw" | undefined): Buffer
        toBuffer(type: "image/png", compressionLevel?: 0|1|2|3|4|5|6|7|8|9, filter?: number): Buffer
        toBuffer(type: "raw" | "image/png" | undefined, callback: (err: any, buf: Buffer) => void): void
        toBuffer(type: "image/png",
            compressionLevel: 0|1|2|3|4|5|6|7|8|9,
            callback: (err: any, buf: Buffer) => void
        ): void
        toBuffer(type: "image/png",
            compressionLevel: 0|1|2|3|4|5|6|7|8|9,
            filter: number,
            callback: (err: any, buf: Buffer) => void
        ): void

        pngStream(options?: PNGStreamOptions): PNGStream
        jpegStream(options?: JPEGStreamOptions): JPEGStream
        pdfStream(): PDFStream
    }

    export interface PDFCanvas extends Canvas {
        getContext(contextId: "2d",
            contextAttributes?: CanvasRenderingContext2DSettings
        ): PDFCanvasRenderingContext2D | null
    }

    export interface PDFCanvasRenderingContext2D extends NodeCanvasRenderingContext2D {
        addPage(): void
    }

    export class Image {
        public static readonly MODE_IMAGE: number
        public static readonly MODE_MIME: number

        public src: Buffer | string
        public dataMode: number
        public readonly complete: boolean
        public width: number
        public height: number

        public constructor(src?: Buffer | string)

    }

    interface PNGStreamOptions {
        palette?: Uint8ClampedArray
        backgroundIndex?: number
    }

    export class PNGStream extends Readable {
        public constructor(canvas: Canvas, options?: PNGStreamOptions)
    }

    interface JPEGStreamOptions {
        bufsize?: number
        quality?: number
        progressive?: boolean
        disableChromaSampling?: boolean
    }

    export class JPEGStream extends Readable {
        public constructor(canvas: Canvas, options?: JPEGStreamOptions)
    }

    export class PDFStream extends Readable {
        public constructor(canvas: Canvas)
    }

    export function createCanvas(width: number, height: number): Canvas
    export function createCanvas(width: number, height: number, type: "pdf"): PDFCanvas
    export function registerFont(path: string, options: { family: string }): void

    type DataURLMIMEType = "image/png" | "image/jpeg"
    interface DataURLJPEGOptions {
        quality: number
    }
    export function toDataURL(type: "image/jpeg" | "image/png",
        quality: undefined | number,
        callback: (url: string) => void
    ): void
    export function toDataURL(type: "image/jpeg" | undefined, callback: (url: string) => void): void
    export function toDataURL(type: "image/jpeg", options: DataURLJPEGOptions, callback: (url: string) => void): void
    export function toDataURL(type: "image/png", quality?: number): string
    export function toDataURL(callback: (url: string) => void): void

    export function loadImage(src: string): Promise<Image>
    export const version: string
    export const cairoVersion: string
    export const jpegVersion: string
    export const gifVersion: string | undefined
    export const freetypeVersion: string
}
