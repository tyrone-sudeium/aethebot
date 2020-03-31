/**
 * Vince McMahon animated reaction meme generator.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 30/01/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { ChildProcess, fork } from "child_process"
import * as FS from "fs"
import * as Path from "path"
import { v4 as uuid } from "uuid"
import * as Discord from "discord.js"
import { Bot } from "../../bot"
import { log } from "../../log"
import { removeBotMentions } from "../../util/remove_mentions"
import { GlobalFeature, MessageContext } from "../feature"

const TRIGGERS = [
    "vince",
]
const PENDING_TEXTS = [
    "one fresh meme coming right up...",
    "ok, working on it, hang on...",
    "`[progress bar goes here]`",
    "got it, will drop it in here soon™",
]

interface WorkerJob {
    id: string
    lines: string[]
    /** Message from the original requester */
    originalMessage: Discord.Message
    /** Message sent by the bot saying "please wait" */
    pendingMessage: Discord.Message
}

export class VinceMcMahonFeature extends GlobalFeature {
    private worker: ChildProcess
    private pendingJobs: Map<string, WorkerJob> = new Map()

    public constructor(bot: Bot, name: string) {
        super(bot, name)
        this.worker = this.newWorker()
    }

    public handlesMessage(context: MessageContext<this>): boolean {
        if (!super.handlesMessage(context)) {
            return false
        }
        const content = removeBotMentions(this.bot, context.message)
        const lines = content.split("\n")
        if (lines.length > 0 && TRIGGERS.includes(lines[0].trim().toLowerCase())) {
            return true
        }

        return false
    }

    public handleMessage(context: MessageContext<this>): boolean {
        const content = removeBotMentions(this.bot, context.message)
        const lines = content.split("\n").splice(1)
        if (lines.length === 0) {
            context.sendNegativeReply("supply each vince panel text on its own line")
            return false
        }
        if (lines.length > 6) {
            context.sendNegativeReply("meme too stronk, maximum of 6 panels")
            return false
        }
        const pendingMsg = PENDING_TEXTS[Math.floor(Math.random() * PENDING_TEXTS.length)]
        context.sendReply(pendingMsg).then(msg => {
            const workerJob: WorkerJob = {
                id: uuid(),
                lines,
                originalMessage: context.message,
                pendingMessage: msg,
            }
            this.pendingJobs.set(workerJob.id, workerJob)
            this.worker.send({id: workerJob.id, lines: workerJob.lines})
        })

        // this.replyMeme(lines, context.message)
        return true
    }

    private newWorker(): ChildProcess {
        const workerModule = Path.resolve(`${__dirname}/../../workers/vince.js`)
        const worker = fork(workerModule, [], {
            execArgv: [],
            stdio: ["ignore", "pipe", "pipe", "ipc"],
        })
        if (worker.stdout) {
            worker.stdout.on("data", chunk => {
                log(chunk.toString("utf8"))
            })
        }
        if (worker.stderr) {
            worker.stderr.on("data", chunk => {
                log(chunk.toString("utf8"))
            })
        }
        worker.on("message", (value: any) => {
            this.onWorkerMessage(value)
        })
        worker.on("error", this.onWorkerError.bind(this))
        worker.on("exit", this.onWorkerExit.bind(this))
        return worker
    }

    private onWorkerError(error: Error): void {
        log(`vince worker error: ${error}`)
        this.worker = this.newWorker()
    }

    private async onWorkerMessage(value: any): Promise<void> {
        const jobId = value.id
        const job = this.pendingJobs.get(jobId)
        if (!job) {
            return
        }
        this.pendingJobs.delete(jobId)
        const attachment = value.filePath as string

        const msgOptions: Discord.MessageOptions = {
            files: [attachment],
        }
        const message = job.originalMessage
        if (job.originalMessage.channel.type === "dm") {
            await message.channel.send(msgOptions)
        } else {
            await message.channel.send(`<@${message.author.id}>`, msgOptions)
        }
        job.pendingMessage.delete()
        await new Promise(resolve => FS.unlink(attachment, resolve))
    }

    private onWorkerExit(): void {
        // workers shouldn't exit :(
        log(`worker ${this.worker.pid} exited...`)
        this.worker = this.newWorker()
    }
}
