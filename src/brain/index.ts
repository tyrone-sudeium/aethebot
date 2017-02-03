/**
 * Abstract memory store for the bot.
 */

/*
 * AetheBot - A Discord Chatbot
 * 
 * Created by Tyrone Trevorrow on 03/02/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 * 
 * This source code is licensed under the permissive MIT license.
 */

import {Brain} from "./brain"
import {MemoryBrain} from "./memory"
import {RedisBrain} from "./redis"

export {Brain, MemoryBrain, RedisBrain}
