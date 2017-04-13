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

import * as Express from "express"
import * as HTTP from "http"
import { Request, Response } from "express"
import * as FS from "fs"
import * as BodyParser from "body-parser"
import { Bot } from "./bot"

export class Website {
    app = Express()
    bot: Bot
    _server: HTTP.Server
    _timer: NodeJS.Timer

    private _adminActions = {
        "DISCORD_RECONNECT": this.reconnectBot.bind(this)
    }

    constructor(bot: Bot) {
        this.bot = bot
    }

    start() {
        const adminParser = BodyParser.urlencoded()
        const port = parseInt((process.env["PORT"] || "8080"))
        this.app.use(Express.static('public'));
        this.app.get("/", this.renderRoot.bind(this))
        this.app.get("/admin", this.renderAdmin.bind(this))
        this.app.post("/admin", adminParser, this.renderAdminPost.bind(this))
        
        this.app.set('view engine', 'pug')
        
        this._server = this.app.listen(port)
        const debug = (process.env["NODE_ENV"] || "development") == "development"
        if (!debug) {
            this._keepAlive()
        }
    }

    close() {
        this._server.close()
        this._server = null
        if (this._timer) {
            clearInterval(this._timer)
            this._timer = null
        }
    }

    reconnectBot() {
        this.bot.reconnect()
    }

    renderRoot(req: Request, res: Response) {
        FS.readFile("package.json", "utf8", (err, str) => {
            const pkg = JSON.parse(str)
            const ver = pkg["version"]
            res.render('index', {ver: ver})
        })
    }

    renderAdmin(req: Request, res: Response) {
        res.render('admin', {actions: Object.keys(this._adminActions)})
    }

    renderAdminPost(req: Request, res: Response) {
        if (!req.body) {
            res.sendStatus(400)
            return
        }
        let action = req.body.action as string
        let password = req.body.password as string
        let expectedPass = process.env["ADMIN_PASSWORD"]
        if (!expectedPass) {
            res.sendStatus(500)
            return
        }
        if (password != expectedPass) {
            res.send("Wrong password")
            res.sendStatus(403)
            return
        }
        let actionFunc = this._adminActions[action]
        if (!actionFunc) {
            res.sendStatus(400)
            return
        }
        actionFunc()
        res.send("ok")
    }

    _keepAlive() {
        // Nothing to see here, Heroku!
        if (this._timer) {
            clearInterval(this._timer)
        }
        this._timer = setInterval(() => {
            HTTP.get("http://aethebot.herokuapp.com")
        }, 300000)
    }
}
