/**
 * Renders stuff on the HTTP ports.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as FS from "fs"
import * as HTTP from "http"
import * as Path from "path"
import * as Querystring from "querystring"

import { Brain, MemoryBrain } from "./brain"
import { sourceVersion } from "./util/version"

// Dedent courtesy of https://github.com/dmnd/dedent
/*
The MIT License (MIT)

Copyright (c) 2015 Desmond Brand (dmnd@desmondbrand.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
function dedent(strings: TemplateStringsArray, ...values: string[]): string {
    const raw = typeof strings === "string" ? [strings] : strings.raw

    // first, perform interpolation
    let result = ""
    for (let i = 0; i < raw.length; i++) {
        result += raw[i]
        // join lines when there is a suppressed newline
            .replace(/\\\n[ \t]*/g, "")
        // handle escaped backticks
            .replace(/\\`/g, "`")

        if (i < values.length) {
            result += values[i]
        }
    }

    // now strip indentation
    const lines = result.split("\n")
    let mindent: number | undefined
    const regex = /^(\s+)\S+/
    for (const l of lines) {
        const m = regex.exec(l)
        if (m) {
            const indent = m[1].length
            if (!mindent) {
                // this is the first indented line
                mindent = indent
            } else {
                mindent = Math.min(mindent, indent)
            }
        }
    }

    if (mindent !== undefined) {
        result = lines.map(l => l.startsWith(" ") ? l.slice(mindent) : l).join("\n")
    }

    return result
        // dedent eats leading and trailing whitespace too
        .trim()
        // handle escaped newlines at the end to ensure they don't get stripped too
        .replace(/\\n/g, "\n")
}

async function readBody(request: HTTP.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = ""
        request.on("data", chunk => {
            data += chunk
        })
        request.on("end", () => resolve(data))
        request.on("error", err => reject(err))
    })
}

function serveStatic(path: string, contentType: string, req: HTTP.IncomingMessage, res: HTTP.ServerResponse): void {
    const resolved = Path.resolve(Path.join("public", path))
    FS.exists(resolved, exists => {
        if (!exists) {
            render404(req, res)
            return
        }
        res.setHeader("Content-Type", contentType)
        res.statusCode = 200
        const fileStream = FS.createReadStream(resolved)
        fileStream.pipe(res)
    })
}

function renderGenericCode(code: number): (req: HTTP.IncomingMessage, res: HTTP.ServerResponse) => void {
    return (req: HTTP.IncomingMessage, res: HTTP.ServerResponse): void => {
        res.statusCode = code
        res.setHeader("Content-Type", "text/plain")
        res.write(`${code}`)
        res.end()
    }
}

const render400 = renderGenericCode(400)
const render403 = renderGenericCode(403)
const render404 = renderGenericCode(404)
const render500 = renderGenericCode(500)

export class Website {
    // public app = Express()

    // Warning: split-brain! If you're really going to use a MemoryBrain
    // make sure it shares the same MemoryBrain instance as the Bot!
    public brain: Brain = new MemoryBrain()
    private server: HTTP.Server | null = null
    private timer: NodeJS.Timer | null = null

    private adminActions: {[key: string]: () => void} = {
        DISCORD_RECONNECT: this.reconnectBot.bind(this),
    }

    public constructor(
        public baseURL: string,
    ) { }

    public start(): void {
        this.server = HTTP.createServer(this.serverCallback.bind(this))
        const port = parseInt((process.env.PORT || "8080"), 10)

        this.server.listen(port)
        const debug = (process.env.NODE_ENV || "development") === "development"
        if (!debug) {
            this.keepAlive()
        }
    }

    public serverCallback(req: HTTP.IncomingMessage, res: HTTP.ServerResponse): void {
        if (!req.url) {
            render404(req, res)
            return
        }
        const url = new URL(`${this.baseURL}${req.url}`)
        if (req.method === "GET") {
            if (url.pathname === "/style.css") {
                serveStatic("style.css", "text/css", req, res)
                return
            } else if (url.pathname === "/" || url.pathname === "") {
                this.renderRoot(req, res)
                return
            } else if (url.pathname === "/admin" || url.pathname === "/admin/") {
                this.renderAdmin(req, res)
                return
            }
        } else if (req.method === "POST") {
            if (url.pathname === "/admin" || url.pathname === "/admin/") {
                this.renderAdminPost(req, res)
                return
            }
        }
        render404(req, res)
    }

    public close(): void {
        if (this.server) {
            this.server.close()
        }
        this.server = null
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
    }

    public reconnectBot(): void {
        this.brain.systemMessages.emit("reconnect")
    }

    public async renderRoot(req: HTTP.IncomingMessage, res: HTTP.ServerResponse): Promise<void> {
        try {
            const str = await new Promise<string>((resolve, reject) => {
                FS.readFile("package.json", "utf8", (err, fileStr) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(fileStr)
                })
            })
            const revision = await sourceVersion()
            const pkg = JSON.parse(str)
            const ver = `${pkg.version}.${revision.slice(0, 8)}`
            res.statusCode = 200
            res.setHeader("Content-Type", "text/html; charset=utf8")
            const html = dedent`
            <html>
                <head>
                    <title>AetheBot</title>
                </head>
                <body>
                    <h1>AetheBot v${ver}</h1>
                    <h2>┗[© ♒ ©]┛ ︵ ┻━┻
                </body>
            </html>`
            res.write(html)
            res.end()
        } catch (error) {
            render500(req, res)
            return
        }
    }

    public renderAdmin(req: HTTP.IncomingMessage, res: HTTP.ServerResponse): void {
        const html = dedent`
        <html>

        <head>
            <title>AetheBot Admin</title>
            <link rel="stylesheet" href="/style.css" />
        </head>

        <body>
            <h1>Admin Page</h1>
            <form id="admin" action="/admin" method="post" enctype="application/x-www-form-urlencoded">
                <ul class="flex-outer">
                    <li>
                        <p>Action:</p>
                        <ul class="flex-inner">
                            <li>
                                <input id="reconnect" 
                                    type="radio" 
                                    name="action" 
                                    value="DISCORD_RECONNECT" 
                                    checked="checked" 
                                />
                                <label for="reconnect">Discord Reconnect</label>
                            </li>
                            <li>
                                <input id="unused" type="radio" name="action" value="UNUSED" />
                                <label for="unused">Unused</label>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <label for="password">Password:</label>
                        <input id="password" type="password" placeholder="password" name="password" />
                    </li>
                    <li>
                        <button id="submit" type="submit">Submit</button>
                    </li>
                </ul>
            </form>
        </body>

        </html>`
        res.setHeader("Content-Type", "text/html; charset=utf8")
        res.write(html)
        res.end()
    }

    public async renderAdminPost(req: HTTP.IncomingMessage, res: HTTP.ServerResponse): Promise<void> {
        try {
            const body = await readBody(req)
            const parts = body.split("&")
            if (parts.length < 2) {
                render400(req, res)
                return
            }
            const pairs = parts.map(str => str.split("="))
            const validPairs = pairs.reduce((prev, val) => val.length === 2 && prev, true)
            if (!validPairs) {
                render400(req, res)
                return
            }
            const map: Map<string, string> = new Map()
            for (const [key, value] of pairs) {
                map.set(key, Querystring.unescape(value))
            }
            const password = map.get("password")
            if (!password) {
                render400(req, res)
                return
            }
            const action = map.get("action")
            if (!action) {
                render400(req, res)
                return
            }
            const actionFunc = this.adminActions[action]
            if (!actionFunc) {
                render400(req, res)
                return
            }
            const expectedPass = process.env.ADMIN_PASSWORD
            if (!expectedPass) {
                render500(req, res)
                return
            }
            if (password !== expectedPass) {
                render403(req, res)
                return
            }
            actionFunc()
            res.statusCode = 200
            res.write(dedent`
            <html>
                <head>
                    <title>AetheBot Admin</title>
                </head>
                <body>
                    <p>ok</p>
                </body>
            </html>
            `)
            res.end()
            return
        } catch (err) {
            render500(req, res)
            return
        }
    }

    private keepAlive(): void {
        // Nothing to see here, Heroku!
        if (this.timer) {
            clearInterval(this.timer)
        }
        this.timer = setInterval(() => {
            HTTP.get(this.baseURL)
        }, 300000)
    }
}
