/**
 * Container for all FFXIV slash commands
 */

/*
* AetheBot - A Discord Chatbot
*
* Created by Tyrone Trevorrow on 04/01/24.
* Copyright (c) 2024 Tyrone Trevorrow. All rights reserved.
*
* This source code is licensed under the permissive MIT license.
*/

import * as Discord from "discord.js"
import { DATA_CENTERS } from "../model/ffxiv-datacenters"
import { stupidTitleCase } from "../util/string_stuff"
import { GlobalFeature, SlashCommand } from "./feature"
import { FFXIVCertificateFeature } from "./ffxiv_certificate_helper"

export class FFXIVSlashCommandsFeature extends GlobalFeature {
    public static slashCommands?: SlashCommand[] | undefined = [
        new Discord.SlashCommandBuilder()
            .setName("xiv")
            .setDescription("FFXIV-related subcommands")
            .addSubcommand(subcommand =>
                subcommand.setName("certificates")
                    .setDescription("Find the best market board items to trade for certificates (FFXIV)")
                    .addStringOption(option =>
                        option.setName("datacentre")
                            .setDescription("Data centre")
                            .setRequired(true)
                            .setChoices(...DATA_CENTERS.map(dc => ({ name: stupidTitleCase(dc), value: dc })))
                    )
                    .addBooleanOption(option =>
                        option.setName("public")
                            .setDescription("Should I post the results publicly?")
                            .setRequired(false)
                    ),
            ),
    ]

    public async handleInteraction(interaction: Discord.Interaction<Discord.CacheType>): Promise<void> {
        if (interaction.isChatInputCommand() && interaction.options.getSubcommand() === "certificates") {
            const feature = this.bot.loadedFeatureForName<FFXIVCertificateFeature>("FFXIVCertificateFeature")
            if (!feature) {
                await interaction.reply({
                    content: "⚠️ FFXIVCertificates feature not loaded in this bot.",
                    ephemeral: true,
                })
                return
            }
            feature.handleInteraction(interaction)
            return
        }
    }

    public handleMessage(): boolean {
        // Doesn't handle any chat messages directly, only slash commands
        return false
    }
}
