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

import * as BodyParser from "body-parser"
import * as Express from "express"
import { Request, Response } from "express"
import * as FS from "fs"
import * as HTTP from "http"

import { Bot } from "./bot"
import { Brain, MemoryBrain } from "./brain"

export class Website {
    public app = Express()

    // Warning: split-brain! If you're really going to use a MemoryBrain
    // make sure it shares the same MemoryBrain instance as the Bot!
    public brain: Brain = new MemoryBrain()
    private server: HTTP.Server | null = null
    private timer: NodeJS.Timer | null = null

    private adminActions: {[key: string]: () => void} = {
        DISCORD_RECONNECT: this.reconnectBot.bind(this),
    }

    constructor(
        public baseURL: string,
    ) { }

    public start() {
        const adminParser = BodyParser.urlencoded()
        const port = parseInt((process.env.PORT || "8080"), 10)
        this.app.use(Express.static("public"))
        this.app.get("/", this.renderRoot.bind(this))
        this.app.get("/admin", this.renderAdmin.bind(this))
        this.app.post("/admin", adminParser, this.renderAdminPost.bind(this))

        this.app.set("view engine", "pug")

        this.server = this.app.listen(port)
        const debug = (process.env.NODE_ENV || "development") === "development"
        if (!debug) {
            this._keepAlive()
        }
    }

    public close() {
        if (this.server) {
            this.server.close()
        }
        this.server = null
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
    }

    public reconnectBot() {
        this.brain.systemMessages.emit("reconnect")
    }

    public renderRoot(req: Request, res: Response) {
        FS.readFile("package.json", "utf8", (err, str) => {
            const pkg = JSON.parse(str)
            const ver = pkg.version
            res.render("index", {ver})
        })
    }

    public renderAdmin(req: Request, res: Response) {
        res.render("admin", {actions: Object.keys(this.adminActions)})
    }

    public renderAdminPost(req: Request, res: Response) {
        if (!req.body) {
            res.sendStatus(400)
            return
        }
        const action = req.body.action as string
        const password = req.body.password as string
        const expectedPass = process.env.ADMIN_PASSWORD
        if (!expectedPass) {
            res.sendStatus(500)
            return
        }
        if (password !== expectedPass) {
            res.send("Wrong password")
            res.sendStatus(403)
            return
        }
        const actionFunc = this.adminActions[action]
        if (!actionFunc) {
            res.sendStatus(400)
            return
        }
        actionFunc()
        res.send("ok")
    }

    private _keepAlive() {
        // Nothing to see here, Heroku!
        if (this.timer) {
            clearInterval(this.timer)
        }
        this.timer = setInterval(() => {
            HTTP.get(this.baseURL)
        }, 300000)
    }
}
