/**
 * Wrapper for meme-generating slash commands.
 */

/*
* AetheBot - A Discord Chatbot
*
* Created by Tyrone Trevorrow on 07/03/23.
* Copyright (c) 2023 Tyrone Trevorrow. All rights reserved.
*
* This source code is licensed under the permissive MIT license.
*/

import * as Discord from "discord.js"
import { v4 as uuid } from "uuid"
import { assertIsError, log } from "../../log"
import { GlobalFeature, SlashCommand } from "../feature"
import { GalaxyBrainFeature } from "./galaxy_brain"
import { VinceMcMahonFeature } from "./vince"

const ORDINALS = [
    "First",
    "Second",
    "Third",
    "Fourth",
    "Fifth",
    "Sixth",
    "Seventh",
    "Eighth",
]

const MEME_TEMPLATES = [
    "VINCE",
    "BRAIN",
] as const
type MemeTemplate = typeof MEME_TEMPLATES[number]

function isMemeTemplate(str: string | null | undefined): str is MemeTemplate {
    if (!str) {
        return false
    }
    return (MEME_TEMPLATES as readonly string[]).includes(str)
}

function getLinesFromModalSubmission(modal: Discord.ModalSubmitFields, template: MemeTemplate): string[] {
    const ids = [0, 1, 2, 3].map(i => `${template}_MODAL_PANEL_${i}`)
    const lines = ids.map(id => modal.getTextInputValue(id))
    const more = modal.getTextInputValue(`${template}_MODAL_PANEL_MORE`).split("\n")
    const allLines = lines.concat(more)
    // Trim off all trailing blank panels
    const revFirstNonBlankIdx = allLines.reverse().findIndex(str => str !== "")
    // Bloody JS reverses in place. wtf.
    allLines.reverse()
    if (revFirstNonBlankIdx !== -1) {
        allLines.splice(allLines.length - revFirstNonBlankIdx)
    }
    return allLines
}

export class MemeFeature extends GlobalFeature {
    public static slashCommands?: SlashCommand[] | undefined = [
        new Discord.SlashCommandBuilder()
            .setName("meme")
            .setDescription("Generate fresh memes from a template")
            .addStringOption(option =>
                option.setName("template")
                    .setDescription("Meme template")
                    .setRequired(true)
                    .addChoices({name: "Vince", value: "VINCE"},
                        {name: "Galaxy Brain", value: "BRAIN"})),
    ]

    public async handleInteraction(interaction: Discord.Interaction<Discord.CacheType>): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return
        }
        const template = interaction.options.getString("template")
        if (!isMemeTemplate(template)) {
            await interaction.reply({content: "⚠️ Unknown template.", ephemeral: true})
            return
        }
        const modal = new Discord.ModalBuilder()
        for (let i = 0; i < 4; i++) {
            const panelInput = new Discord.TextInputBuilder()
                .setCustomId(`${template}_MODAL_PANEL_${i}`)
                .setLabel(`${ORDINALS[i]} Panel`)
                .setStyle(Discord.TextInputStyle.Short)
                .setMaxLength(120)
            if (i !== 0) {
                panelInput.setRequired(false)
            }
            const actionRow = new Discord.ActionRowBuilder<Discord.ModalActionRowComponentBuilder>()
                .addComponents(panelInput)
            modal.addComponents(actionRow)
        }
        const moreInput = new Discord.TextInputBuilder()
            .setCustomId(`${template}_MODAL_PANEL_MORE`)
            .setStyle(Discord.TextInputStyle.Paragraph)
            .setMaxLength(500)
            .setRequired(false)
        const moreRow = new Discord.ActionRowBuilder<Discord.ModalActionRowComponentBuilder>()
            .addComponents(moreInput)
        modal.addComponents(moreRow)

        let maximumPanels = 6
        if (template === "VINCE") {
            modal.setTitle("Vince Meme")
            moreInput.setLabel("More. One panel per line. Maximum 2 lines.")
        } else if (template === "BRAIN") {
            modal.setTitle("Galaxy Brain Meme")
            moreInput.setLabel("More. One panel per line. Maximum 5 lines.")
            maximumPanels = 9
        }

        const id = uuid()
        modal.setCustomId(id)
        await interaction.showModal(modal)
        try {
            const res = await interaction.awaitModalSubmit({
                time: 120_000,
                filter: x => x.customId === id,
            })
            const lines = getLinesFromModalSubmission(res.fields, template)
            if (lines.length > maximumPanels) {
                await res.reply({content: `⚠️ Meme too strong. Maximum ${maximumPanels} panels.`, ephemeral: true})
                return
            }

            if (template === "VINCE") {
                const feature = this.bot.loadedFeatureForName<VinceMcMahonFeature>("VinceMcMahonFeature")
                if (!feature) {
                    await res.reply({content: "⚠️ Vince feature not loaded in this bot.", ephemeral: true})
                    return
                }
                feature.queueNewJobFromModal(res, lines)
            } else if (template === "BRAIN") {
                const feature = this.bot.loadedFeatureForName<GalaxyBrainFeature>("GalaxyBrainFeature")
                if (!feature) {
                    await res.reply({content: "⚠️ Vince feature not loaded in this bot.", ephemeral: true})
                    return
                }
                const memeData = await feature.generateMeme(lines)
                if (!memeData) {
                    await res.reply({content: "⚠️ Something's cooked. Check the logs.", ephemeral: true})
                    return
                }
                res.reply({files: [new Discord.AttachmentBuilder(memeData, {name: "meme.png"})]})
            }
        } catch (error) {
            assertIsError(error)
            log(`meme: error ${error.message}`)
        }
    }

    public handleMessage(): boolean {
        // Only handles slash commands.
        return false
    }
}
