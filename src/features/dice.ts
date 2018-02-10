/**
 * Random number generator.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 10/02/18.
 * Copyright (c) 2018 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import * as Discord from "discord.js"
import * as randomNumber from "random-number-csprng"
import { Feature } from "./feature"

export class DiceFeature extends Feature {
    public handleMessage(message: Discord.Message): boolean {
        const tokens = this.commandTokens(message)
        if (tokens.length > 2) {
            return false
        }
        const command = tokens[0].toLowerCase()
        if (!/^(dice)|(rand)|(random)|(rng)/.test(command)) {
            return false
        }
        let maximum = 100
        if (tokens.length > 1 && tokens[1] && /^\d+d\d+$/.test(tokens[1])) {
            try {
                const diceValues = tokens[1].split("d")
                const numberOfDice = this.sanitizeNumberInput(diceValues[0])
                const diceSides = this.sanitizeNumberInput(diceValues[1])
                this.respondWithDice(message, numberOfDice, diceSides)
            } catch (error) {
                this.replyWith(message, "??")
                return true
            }
            return true
        }

        if (tokens.length > 1 && tokens[1] && /^\d+$/.test(tokens[1])) {
            try {
                maximum = this.sanitizeNumberInput(tokens[1])
            // tslint:disable-next-line:no-empty
            } catch (error) {
                this.replyWith(message, "??")
                return true
            }
        }

        this.respondWithNumber(message, maximum)
        return true
    }

    private sanitizeNumberInput(numberStr: string): number {
        const parsed = parseInt(numberStr, 10)
        if (isNaN(parsed) || parsed > 4294967295) {
            throw new Error("invalid number")
        }
        return parsed
    }

    private async respondWithNumber(message: Discord.Message, maximum: number): Promise<void> {
        const num = await randomNumber(0, maximum)
        this.replyWith(message, `🎲 ${num}`)
    }

    private async respondWithDice(message: Discord.Message, numberOfDice: number, sides: number): Promise<void> {
        const rolls: number[] = []
        for (let i = 0; i < numberOfDice; i++) {
            rolls.push(await randomNumber(1, sides))
        }
        const total = rolls.reduce((a, b) => a + b, 0)
        if (numberOfDice > 1) {
            this.replyWith(message, `🎲 ${total} [${rolls.join(", ")}]`)
        } else {
            this.replyWith(message, `🎲 ${total}`)
        }
    }
}
