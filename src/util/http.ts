/**
 * Because Node's APIs are awful.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 01/01/19.
 * Copyright (c) 2019 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */
import * as HTTP from "http"
import * as HTTPS from "https"
import { URL } from "url"

// Fix the shit type definitions for node
declare module "https" {
    export function get(url: string,
        options: HTTP.RequestOptions,
        callback?: (res: HTTP.IncomingMessage) => void): HTTP.ClientRequest
}

interface HTTPModule {
    get(url: string, options: HTTP.RequestOptions, callback?: (res: HTTP.IncomingMessage) => void): HTTP.ClientRequest
    request(options: HTTP.RequestOptions, callback?: (res: HTTP.IncomingMessage) => void): HTTP.ClientRequest
}

interface HTTPHeaders {
    [header: string]: string
}

interface HTTPOptions {
    headers?: HTTPHeaders
    outputStream?: NodeJS.WritableStream
}

export async function getHTTPData(url: string): Promise<Buffer>
export async function getHTTPData(url: string, options?: HTTPOptions): Promise<Buffer | undefined>

export async function getHTTPData(url: string, options?: HTTPOptions): Promise<Buffer | undefined> {
    let httpModule: HTTPModule = HTTP
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol.toLowerCase() === "https:") {
        httpModule = HTTPS
    }
    const headers = (options?.headers) || {}

    return new Promise((resolve, reject) => {
        const getRequest = httpModule.get(url, {
            headers,
        }, resp => {
            resp.on("error", reject)
            const statusCode = resp.statusCode

            let error
            if (statusCode !== 200) {
                error = new Error("Request Failed.\n" +
                                `Status Code: ${statusCode}`)
            }
            if (error) {
                reject(error)
                resp.resume()
                return
            }

            if (options && options.outputStream) {
                const stream = options.outputStream
                resp.pipe(stream)
                stream.on("finish", () => {
                    resolve(undefined)
                })
            } else {
                const rawData: Buffer[] = []
                resp.on("data", (chunk: Buffer) => rawData.push(chunk))
                resp.on("end", () => {
                    resolve(Buffer.concat(rawData))
                })
            }
        })
        getRequest.on("error", reject)
    })
}

export async function getJSON(url: string, headers: {[header: string]: string} = {}): Promise<any> {
    const data = await getHTTPData(url, {headers}) as Buffer
    const parsedData = JSON.parse(data.toString("utf8"))
    return parsedData
}

export interface HEADResult {
    statusCode: number
    headers: HTTP.IncomingHttpHeaders
}

export async function head(url: string, headers?: HTTPHeaders): Promise<HEADResult> {
    let httpModule: HTTPModule = HTTP
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol.toLowerCase() === "https:") {
        httpModule = HTTPS
    }
    const options: HTTP.RequestOptions = {
        host: parsedUrl.host,
        method: "HEAD",
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        port: parseInt(parsedUrl.port, 10),
        protocol: parsedUrl.protocol,
    }
    if (headers) {
        options.headers = headers
    }
    return new Promise((resolve, reject) => {
        const req = httpModule.request(options, resp => {
            resp.on("error", reject)
            let error
            if (error) {
                reject(error)
                resp.resume()
                return
            }
            if (!resp.statusCode) {
                reject("No status code")
                return
            }
            resolve({
                statusCode: resp.statusCode,
                headers: resp.headers,
            })
        })
        req.on("error", reject)
        req.end()
    })
}
