/**
 * Pulls MP4 video from v.redd.it and reuploads to Discord if appropriately
 * sized.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 27/12/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import anchorme from "anchorme"
import * as arrayFlatten from "array-flatten"
import * as Discord from "discord.js"
import * as FS from "fs"
import * as OS from "os"
import * as Path from "path"
import { URL } from "url"
import * as xml2js from "xml2js"
import { getHTTPData, getJSON, head } from "../util/http"
import { Feature } from "./feature"

const DISCORD_UPLOAD_LIMIT = 8_000_000

interface PlaylistSegment {
    bandwidth: number
    codecs: string
    mimeType: string
    id: string
    url: string
}

interface AnchormeResult {
    reason: string
    protocol: string
    raw: string
    encoded: string
}

export function dashPlaylistURLFromVRedditURL(url: string): string {
    return `${url}/DASHPlaylist.mpd`
}

export async function getVRedditURLFromRedditURL(url: string): Promise<string | null> {
    const parsedURL = new URL(url)
    // Drop the query params
    parsedURL.search = ""
    // Strip off any trailing /
    if (parsedURL.pathname.substr(-1) === "/") {
        let path = parsedURL.pathname
        path = path.substr(0, path.length - 1)
        parsedURL.pathname = path
    }
    // Add .json to the end
    parsedURL.pathname = `${parsedURL.pathname}.json`
    // Hit the API
    const jsonURL = parsedURL.toString()
    const redditJSON = await getJSON(jsonURL)
    // Get the v.redd.it link (if any)
    const vReddit = getVRedditURLFromAPIResponse(redditJSON)
    if (vReddit == null) {
        return null
    }
    return vReddit
}

export function getVRedditURLFromAPIResponse(data: any): string | null {
    for (const obj of data) {
        if (obj.data && obj.data.children) {
            for (const post of obj.data.children) {
                if (post.data && post.data.url && post.data.is_video) {
                    const parsedURL = new URL(post.data.url)
                    if (parsedURL.host.toLowerCase() === "v.redd.it") {
                        return post.data.url
                    }
                } else {
                    continue
                }
            }
        } else {
            continue
        }
    }
    return null
}

export async function getDashPlaylist(playlistURL: string): Promise<any> {
    const xmlBuffer = await getHTTPData(playlistURL)
    const xml = xmlBuffer.toString("utf8")
    return new Promise((resolve, reject) => {
        xml2js.parseString(xml, (err, result) => {
            if (err) {
                reject(err)
                return
            }
            resolve(result)
        })
    })
}

export function playlistSegmentsFromXML(xml: any, baseURL: string): PlaylistSegment[] {
    if (!xml.MPD || !xml.MPD.Period) {
        return []
    }
    return arrayFlatten(xml.MPD.Period.map((p: any) => {
        if (!p.AdaptationSet) {
            return []
        }
        return p.AdaptationSet.map((s: any) => {
            if (!s.Representation) {
                return []
            }
            return s.Representation.map((r: any) => parsePlaylistSegment(r, baseURL))
        })
    }))
}

export function parsePlaylistSegment(xml: any, baseUrl: string): PlaylistSegment {
    return {
        bandwidth: parseInt(xml.$.bandwidth, 10),
        codecs: xml.$.codecs,
        id: xml.$.id,
        mimeType: xml.$.mimeType,
        url: `${baseUrl}/${xml.BaseURL}`,
    }
}

function objectKeysToLowercase<T, U extends {[index: string]: T}>(object: U): U {
    const newObj: U = {} as U
    const keys = Object.keys(object)
    keys.forEach((k) => newObj[k.toLowerCase()] = object[k])
    return newObj
}

export async function findBestSegment(segments: PlaylistSegment[]): Promise<PlaylistSegment | null> {
    // Sort the segments by bandwidth and start with the biggest first
    const sorted = segments.sort((a, b) => b.bandwidth - a.bandwidth)
    // Filter out the ones that don't match our needs
    const filtered = sorted.filter((seg) => {
        if (seg.mimeType !== "video/mp4") {
            return false
        }
        return true
    })
    for (const segment of filtered) {
        const headers = await head(segment.url)
        const normalized = objectKeysToLowercase(headers)
        const contentLengthStr = normalized["content-length"]
        if (!contentLengthStr) {
            continue
        }
        const contentLength = parseInt(contentLengthStr, 10)
        if (!isNaN(contentLength) && contentLength < DISCORD_UPLOAD_LIMIT) {
            // We have a winner
            return segment
        }
    }
    return null
}

function isValidVRedditURL(url: URL): boolean {
    // Must be on v.redd.it
    if (url.host.toLowerCase() !== "v.redd.it") {
        return false
    }
    // Must have no query params
    if (url.search !== "") {
        return false
    }
    // Must have no username or password
    if (url.username !== "" || url.password !== "") {
        return false
    }
    // Path must start with "/"
    if (url.pathname[0] !== "/") {
        return false
    }
    // Path must have one segment
    const segments = url.pathname.split("/")
    if (segments.length !== 2) {
        return false
    }
    if (segments[0] !== "") {
        return false
    }
    return true
}

async function normalizeRedditUrl(url: RedditURL): Promise<URL | null> {
    let vUrl: URL
    if (url.type === "api") {
        const potentialUrl = await getVRedditURLFromRedditURL(url.url.toString())
        if (!potentialUrl) {
            return null
        }
        vUrl = new URL(potentialUrl)
    } else {
        vUrl = url.url
    }
    return vUrl
}

async function processRedditUrl(sourceMessage: Discord.Message, vUrl: URL): Promise<string | null> {
    const dashUrl = dashPlaylistURLFromVRedditURL(vUrl.toString())

    try {
        const pathSegments = vUrl.pathname.split("/")
        const videoId = pathSegments[1]
        const xml = await getDashPlaylist(dashUrl)
        const segments = playlistSegmentsFromXML(xml, vUrl.toString())
        const bestSegment = await findBestSegment(segments)
        if (!bestSegment) {
            return null
        }
        const filePath = Path.join(OS.tmpdir(), `${videoId}.mp4`)
        const fileStream = FS.createWriteStream(filePath)
        try {
            await getHTTPData(bestSegment.url, {outputStream: fileStream})
        } catch (error) {
            fileStream.close()
            FS.unlinkSync(filePath)
            throw error
        }
        fileStream.close()
        return filePath
    } catch (error) {
        return null
    }
    return null
}

const commentsRegex = /(old|new|www|m|api)\.reddit\.com\/r\/.+\/comments/

interface RedditURL {
    type: "v" | "api"
    url: URL
}

interface PendingRedditTask {
    url: RedditURL
    sourceMessage: Discord.Message
    destinationMessage: Discord.Message
}

export class RedditVideoFeature extends Feature {

    public handlesMessage(message: Discord.Message): boolean {
        if (message.content.toLowerCase().indexOf("v.redd.it") !== -1) {
            return true
        }

        if (commentsRegex.test(message.content.toLowerCase())) {
            return true
        }
        return false
    }

    public handleMessage(message: Discord.Message): boolean {
        const urlsInMsg = anchorme(message.cleanContent, {list: true}) as AnchormeResult[]
        const redditUrls = urlsInMsg.map((res) => {
            const url = new URL(res.raw)
            if (commentsRegex.test(res.raw)) {
                return {
                    type: "api",
                    url,
                } as RedditURL
            }
            if (isValidVRedditURL(url)) {
                return {
                    type: "v",
                    url,
                } as RedditURL
            }
            return null
        }).filter((url) => url !== null) as RedditURL[]

        this.asyncHandleMessage(message, redditUrls)
        return true
    }

    private async asyncHandleMessage(message: Discord.Message, redditUrls: RedditURL[]): Promise<void> {
        const normalized = await Promise.all(redditUrls.map((url) => normalizeRedditUrl(url)))
        const normalizedUrls = normalized.filter((res) => res !== null) as URL[]
        if (normalizedUrls.length === 0) {
            return
        }
        const noun = normalizedUrls.length === 1 ? "video" : "videos"
        const destMsg = await message.channel.send(`Just a sec, pulling the ${noun} from reddit ...`) as Discord.Message
        for (const url of normalizedUrls) {
            const result = await processRedditUrl(message, url)
            if (result) {
                await message.channel.send({files: [result]})
            }
        }
    }
}
