/**
 * Useful TypeScript type predicates.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 23/01/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

export function isNotNullary<V>(value: V | null | undefined): value is V {
    return value !== null && value !== undefined
}
