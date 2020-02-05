/**
 * Spits out incoming messages to the log in debug mode.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { log } from "../log"
import { GlobalFeature, MessageContext } from "./feature"

export class DebugFeature extends GlobalFeature {

    public handlesMessage(): boolean {
        // Debug logging handles every message.
        return true
    }

    public handleMessage(context: MessageContext<this>): boolean {
        log("incoming message: " + context.message.content)
        return true
    }
}
