/**
 * Just some string stuff
 */

/*
* AetheBot - A Discord Chatbot
*
* Created by Tyrone Trevorrow on 04/01/24.
* Copyright (c) 2024 Tyrone Trevorrow. All rights reserved.
*
* This source code is licensed under the permissive MIT license.
*/

/** Extremely naïve title case: just upcases first char. No bounds checking. */
export function stupidTitleCase(str: string): string {
    return str[0].toUpperCase() + str.slice(1)
}
