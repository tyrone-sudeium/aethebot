/**
 * Persistent context data for reaction roles
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 23/06/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { Bot } from "../bot"
import { Persistent, PersistentProperty } from "./persistent"

interface EmojiRole {
    emojiId: string
    roleId: string
    desc: string
}

export interface ReactionRoleMessage {
    id: string
    map: {[emojiIdKey: string]: EmojiRole}
}

export class ReactionRolesContext extends Persistent {
    public guildId: string

    @PersistentProperty()
    public messages: ReactionRoleMessage[] = []

    public constructor(bot: Bot, guildId: string) {
        super(bot)
        this.guildId = guildId
    }

    protected get brainKey(): string {
        return `model:reaction_roles:${this.guildId}`
    }
}
