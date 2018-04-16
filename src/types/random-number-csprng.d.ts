/**
 * Type definition for random-number-csprng.
 */

/*
 * AetheBot - A Discord Chatbot
 * 
 * Created by Tyrone Trevorrow on 16/04/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 * 
 * This source code is licensed under the permissive MIT license.
 */

declare module "random-number-csprng" {
    export = secureRandomNumber

    function secureRandomNumber(minimum: number, maximum: number, cb?: (num: number) => void): Promise<number>

    namespace secureRandomNumber {
        const RandomGenerationError: Error
    }
}

