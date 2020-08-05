/**
 * Shuffles an array. How is this not builtin??.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 05/08/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

export function shuffle<T>(a: T[]): T[] {
    let j = 0
    let i = 0

    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        const x = a[i]
        a[i] = a[j]
        a[j] = x
    }

    return a
}
