/**
 * Bot-specific Persisted User
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 11/05/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { Bot } from "../bot"
import { Persistent, PersistentProperty } from "./persistent"

type GlobalRole = "admin"

export class User extends Persistent {

    @PersistentProperty()
    public roles?: GlobalRole[]

    private internalId: string

    public constructor(bot: Bot, id: string) {
        super(bot)
        this.internalId = id
    }

    public get id(): string {
        return this.internalId
    }

    public get isAdmin(): boolean {
        if (!this.roles) {
            return false
        }
        return this.roles.includes("admin")
    }

    protected get brainKey(): string {
        return `model:user:${this.id}`
    }
}
