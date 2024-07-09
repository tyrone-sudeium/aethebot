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

import * as FS from "fs"
import * as Path from "path"
import * as NodeWorker from "node:worker_threads"
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

interface WorkerJobChat {
    type: "chat"
    id: string
    lines: string[]
    /** Message from the original requester */
    originalContext: MessageContext<VinceMcMahonFeature>
    /** Message sent by the bot saying "please wait" */
    pendingMessage: Discord.Message
}

interface WorkerJobSlashCommand {
    type: "slashcommand"
    id: string
    lines: string[]
    /** Modal form that requested this image */
    modal: Discord.ModalSubmitInteraction<Discord.CacheType>
}

type WorkerJob = WorkerJobChat | WorkerJobSlashCommand

export class VinceMcMahonFeature extends GlobalFeature {
    private worker: Worker | NodeWorker.Worker
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
                type: "chat",
                id: uuid(),
                lines,
                originalContext: context,
                pendingMessage: msg,
            }
            this.pendingJobs.set(workerJob.id, workerJob)
            this.worker.postMessage({id: workerJob.id, lines: workerJob.lines})
        })

        // this.replyMeme(lines, context.message)
        return true
    }

    public queueNewJobFromModal(modal: Discord.ModalSubmitInteraction<Discord.CacheType>, lines: string[]): void {
        const workerJob: WorkerJob = {
            type: "slashcommand",
            id: uuid(),
            lines,
            modal,
        }
        this.pendingJobs.set(workerJob.id, workerJob)
        this.worker.postMessage({id: workerJob.id, lines: workerJob.lines})
    }

    private newWorker(): Worker | NodeWorker.Worker {
        let workerModule = Path.resolve(`${__dirname}/../../workers/vince.js`)
        if (global.Worker) {
            // Web Worker API is available (Bun or Deno?)
            if (process.versions.bun) {
                if (process.env.NODE_ENV === "production") {
                    // When running in bun on production the workers are alongside the index.js
                    workerModule = "./workers/vince.js"
                } else {
                    // In dev, we can load the TypeScript src directly!
                    workerModule = Path.resolve(`${__dirname}/../../workers/vince.ts`)
                }
            }

            const worker = new Worker(workerModule)
            worker.addEventListener("message", ev => {
                this.onWorkerMessage(ev.data)
            })
            worker.addEventListener("error", (ev: ErrorEvent) => {
                this.onWorkerError(ev.message)
            })
            worker.addEventListener("terminate", () => {
                this.onWorkerExit()
            })

            return worker
        } else {
            // Use Node's worker_threads API
            const worker = new NodeWorker.Worker(workerModule)
            worker.on("message", value => {
                this.onWorkerMessage(value)
            })
            worker.on("error", err => {
                this.onWorkerError(err.message)
            })
            worker.on("exit", () => this.onWorkerExit())
            return worker
        }
    }

    private onWorkerError(error: string): void {
        log(`vince worker error: ${error}`, "always")
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
        if (job.type === "chat") {
            await job.originalContext.sendReplyFiles(undefined, [{data: attachment, name: "vince.gif"}])
            job.pendingMessage.delete()
        } else {
            await job.modal.reply({files: [new Discord.AttachmentBuilder(attachment, {name: "vince.gif"})]})
        }
        await new Promise(resolve => FS.unlink(attachment, resolve))
    }

    private onWorkerExit(): void {
        // workers shouldn't exit :(
        log("vince: worker exited...", "always")
        this.worker = this.newWorker()
    }
}
