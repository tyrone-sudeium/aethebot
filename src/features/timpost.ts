/**
 * Tim can't post
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 27/01/21.
 * Copyright (c) 2021 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { MessageContext, ServerFeature } from "./feature"

const regex = /preview\.redd\.it\/([a-z0-9]+)\.gif/g

export class TimPostFeature extends ServerFeature {
    public handlesMessage(context: MessageContext<this>): boolean {
        if (regex.test(context.message.content)) {
            return true
        } else {
            return false
        }
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const posts: string[] = []
        for (const match of context.message.content.matchAll(new RegExp(regex))) {
            posts.push(`https://i.redd.it/${match[1]}.gif`)
        }
        const message = `Un-timposting it: ${posts.join("\n")}`
        context.message.channel.send(message)
        return true
    }
}
