/**
 * Pulls MP4 video from TikTok and reuploads to Discord if appropriately
 * sized.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 27/04/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */
import * as FS from "fs"
import * as OS from "os"
import * as Path from "path"
import * as Discord from "discord.js"
import anchorme from "anchorme"
import { getHTTPData, head } from "../../util/http"
import { MessageContext, ServerFeature } from "../feature"
import { AnchormeResult, FILE_TOO_BIG, downloadFile } from "./common"

async function unshortenVMTikTokURL(vmTikTokURL: URL): Promise<URL> {
    const resp = await head(vmTikTokURL.toString())
    if (resp.statusCode === 301 && resp.headers.location) {
        return new URL(resp.headers.location)
    } else {
        throw new Error("Bad response from vm.tiktok.com")
    }
}

const initPropsRegex = /<script>window\.__INIT_PROPS__\s+=\s+(.*)<\/script>/

interface TikTokVideo {
    id: string
    downloadURL: URL
}

const iPadUserAgent = "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) " +
    "Version/11.0 Mobile/15A5341f Safari/604.1"

async function getVideoMetadata(tikTokURL: URL): Promise<TikTokVideo> {
    const resp = await getHTTPData(tikTokURL.toString(), {
        headers: {
            "User-Agent": iPadUserAgent,
        },
    })
    if (!resp) {
        throw new Error("Network error")
    }
    const respStr = resp.toString("utf-8")
    const matches = initPropsRegex.exec(respStr)
    if (!matches) {
        throw new Error("TikTok page parser issue, maybe AetheBot needs updating?")
    }
    const propsJsonStr = matches[1]
    const propsJson = JSON.parse(propsJsonStr)
    const urls = propsJson?.["/v/:id"]?.videoData?.itemInfos?.video?.urls
    const id =  propsJson?.["/v/:id"]?.videoData?.itemInfos?.id
    if (!urls || !urls.length) {
        throw new Error("TikTok JSON parser issue, maybe AetheBot needs updating?")
    }
    return {
        id,
        downloadURL: new URL(urls[0]),
    }
}

// Returns: file path to the downloaded TikTok video, if things go well.
async function processTikTokUrl(sourceMessage: Discord.Message, vmTikTokURL: URL): Promise<string | null> {
    const realURL = await unshortenVMTikTokURL(vmTikTokURL)
    const meta = await getVideoMetadata(realURL)
    const filePath = Path.join(OS.tmpdir(), `${meta.id}.mp4`)
    const download = await downloadFile(meta.downloadURL.toString(), filePath, {
        "User-Agent": iPadUserAgent,
        "Referer": "https://www.tiktok.com/",
        "Origin": "https://www.tiktok.com",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US;en;q=0.5",
    })
    return download.path
}

export class TikTokVideoFeature extends ServerFeature {

    public handlesMessage(context: MessageContext<this>): boolean {
        const message = context.message
        if (message.content.toLowerCase().includes("vm.tiktok.com")) {
            return true
        }

        return false
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const urlsInMsg = anchorme(context.message.cleanContent, {list: true}) as AnchormeResult[]
        const tiktokUrls = urlsInMsg.map(a => new URL(a.raw))
        this.asyncHandleMessage(context, tiktokUrls)
        return true
    }

    private async asyncHandleMessage(context: MessageContext<this>, tiktokUrls: URL[]): Promise<void> {
        const message = context.message
        if (tiktokUrls.length === 0) {
            return
        }
        const noun = tiktokUrls.length === 1 ? "video" : "videos"
        const pendingStr = `Just a sec, pulling the ${noun} from, ugh, TikTok...`
        const pendingMsg = await message.channel.send(pendingStr)
        for (const url of tiktokUrls) {
            let result: string | null = null
            try {
                result = await processTikTokUrl(message, url)
            } catch (error) {
                const msg = error.message
                pendingMsg.edit(`Just a sec, pulling the ${noun} from, ugh, TikTok... ah she's fucked (${msg})`)
            }
            if (result) {
                try {
                    await message.channel.send({files: [result]})
                } catch (error) {
                    pendingMsg.edit(`Just a sec, pulling the ${noun} from, ugh, TikTok... ` +
                        `ah she's fucked (${FILE_TOO_BIG})`)
                }
                FS.unlinkSync(result)
            }
        }
    }
}
