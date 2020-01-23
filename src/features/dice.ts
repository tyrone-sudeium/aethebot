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
import { GlobalFeature } from "./feature"
import { pushReroll, Rerollable } from "./reroll"

interface NumberRequest {
    type: "number"
    maximum: number
}

interface DiceRequest {
    type: "dice"
    dice: number
    sides: number
}

type Request = NumberRequest | DiceRequest

function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x)
}

export class DiceFeature extends GlobalFeature implements Rerollable {
    public handleMessage(message: Discord.Message): boolean {
        const tokens = this.commandTokens(message)
        if (tokens.length > 2) {
            return false
        }
        const command = tokens[0].toLowerCase()
        if (!/^(dice)|^(rand)|^(random)|^(rng)|^(roll)/.test(command)) {
            return false
        }
        let maximum = 100
        if (tokens.length > 1 && tokens[1] && /^\d+d\d+$/.test(tokens[1])) {
            try {
                const diceValues = tokens[1].split("d")
                const numberOfDice = this.sanitizeNumberInput(diceValues[0])
                const diceSides = this.sanitizeNumberInput(diceValues[1])
                if (diceSides <= 1 || numberOfDice > 20) {
                    this.replyNegatively(message)
                    return true
                }
                this.respondWithRequest(message, {
                    dice: numberOfDice,
                    sides: diceSides,
                    type: "dice",
                })
            } catch (error) {
                this.replyNegatively(message)
                return true
            }
            return true
        }

        if (tokens.length > 1 && tokens[1]) {
            try {
                maximum = this.sanitizeNumberInput(tokens[1])
            } catch (error) {
                this.replyNegatively(message)
                return true
            }
        }

        this.respondWithRequest(message, {
            maximum,
            type: "number",
        })
        return true
    }

    public reroll(params: any, originalMessage: Discord.Message): Promise<string> {
        return this.responseForRequest(params)
    }

    private sanitizeNumberInput(numberStr: string): number {
        const parsed = parseInt(numberStr, 10)
        if (isNaN(parsed) || parsed > 4294967295 || parsed < 1) {
            throw new Error("invalid number")
        }
        return parsed
    }

    private async respondWithRequest(message: Discord.Message, req: Request): Promise<void> {
        const response = await this.responseForRequest(req)
        const uploadedMessage = await this.replyWith(message, response)
        await pushReroll(this, uploadedMessage, message, req)
    }

    private async responseForRequest(req: Request): Promise<string> {
        switch (req.type) {
            case "number": return await this.responseWithNumber(req.maximum)
            case "dice": return await this.responseWithDice(req.dice, req.sides)
            default: return assertNever(req)
        }
    }

    private async responseWithNumber(maximum: number): Promise<string> {
        const num = await randomNumber(0, maximum)
        return `🎲 ${num}`
    }

    private async responseWithDice(numberOfDice: number, sides: number): Promise<string> {
        const rolls: number[] = []
        for (let i = 0; i < numberOfDice; i++) {
            rolls.push(await randomNumber(1, sides))
        }
        const total = rolls.reduce((a, b) => a + b, 0)
        if (numberOfDice > 1) {
            return `🎲 ${total} [${rolls.join(", ")}]`
        } else {
            return `🎲 ${total}`
        }
    }
}
