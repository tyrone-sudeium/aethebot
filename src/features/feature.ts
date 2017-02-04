/**
 * Abstract robot capability.
 */

/*
 * AetheBot - A Discord Chatbot
 * 
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 * 
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"

export abstract class Feature {
    botUser: Discord.User

    constructor(botUser: Discord.User) {
        this.botUser = botUser
    }
    
    abstract handleMessage(message: Discord.Message): boolean
}
