/**
 * Promise that resolves after a period of time.
 */

/*
* AetheBot - A Discord Chatbot
*
* Created by Tyrone Trevorrow on 09/02/22.
* Copyright (c) 2022 Tyrone Trevorrow. All rights reserved.
*
* This source code is licensed under the permissive MIT license.
*/

export async function wait(seconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000.0)
    })
}
