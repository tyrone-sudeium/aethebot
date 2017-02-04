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
import {Request, Response} from "express"
import * as FS from "fs"

export class Website {
    app = Express()
    
    start() {
        const port = parseInt((process.env["PORT"] || "80"))
        this.app.get("/", this.renderRoot.bind(this))
        this.app.listen(port)
    }

    renderRoot(req: Request, res: Response) {
        FS.readFile("package.json", "utf8", (err, str) => {
            const pkg = JSON.parse(str)
            const ver = pkg["version"]
            let out = "<!DOCTYPE html>\n\n" +
                "<html>" +
                "<head><title>AetheBot</title><head>" +
                "<body>" +
                `<h1>AetheBot v${ver}</p>` +
                "<h2>┗[© ♒ ©]┛ ︵ ┻━┻</h2>" +
                "</body>" +
                "</html>"
            res.send(out)
        })
    }
}
