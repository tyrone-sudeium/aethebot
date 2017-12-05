/**
 * All the different noises it can post.
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 01/04/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

export interface Noise {
    id: string,
    files: string[],
    regex: RegExp[],
    fallbackImageURL?: string
}

export const NOISES: Noise[] = [
    {
        files: ["ostrich.dat"],
        id: "OSTRICH",
        regex: [/^haha\!?$/i, /^ostrich$/i],
    },
    {
        fallbackImageURL: "https://cdn.discordapp.com/attachments/293954139845820416/373612584722628608/thebest.gif",
        files: ["thebest4.dat"],
        id: "THEBEST4",
        regex: [/^the\s?best$/i],
    },
    {
        files: ["enya.dat"],
        id: "ENYA",
        regex: [/^enya$/i, /^only\s?time$/i, /^enya\s-*\sonly\stime$/i],
    },
    {
        files: ["deadinside.dat"],
        id: "DEADINSIDE",
        regex: [/^dead\sinside$/i],
    },
    {
        files: ["ohjeez.dat"],
        id: "OHJEEZ",
        regex: [/^o+h+ [gj]ee+z+$/i],
    },
    {
        files: ["ohbees.dat"],
        id: "OHBEES",
        regex: [/^o+h+ [b]ee+s$/i],
    },
    {
        files: ["untitled.dat"],
        id: "UNTITLED",
        regex: [
            /^untitled$/i,
            /^simple\s+plan$/i,
            /^how\s*could\s*this\s*happen\s*to\s*me\??$/i,
        ],
    },
    {
        files: ["20cooler.dat"],
        id: "20PERCENTCOOLER",
        regex: [/^20%\s*cooler$/i, /^twenty\s*percent\s*cooler$/i],
    },
    {
        files: ["hueys.dat"],
        id: "HUEYS",
        regex: [/^(distant[\s]+)?(hu(ey|ie)s|chopper(s?))$/i],
    },
    {
        files: ["sadviolin.dat"],
        id: "SADVIOLIN",
        regex: [/^(sad|tiny)[\s]+violins?$/i],
    },
    {
        files: ["silence.dat"],
        id: "SOUNDOFSILENCE",
        regex: [
            /^hello da?rk(ness)?( my old friend)?$/i,
            /^sound of silence$/,
        ],
    },
    {
        files: ["dundundunn.dat"],
        id: "DUNDUNDUNN",
        regex: [
            /^dun\s*dun\s*dun+$/,
        ],
    },
    {
        files: ["pussieeeee.dat"],
        id: "PUSSIEEEEE",
        regex: [
            /^((i'll have you know)? (that )?there's no )?pu+ss+i+e+?$/i,
        ],
    },
    {
        files: ["weed.dat"],
        id: "WEED",
        regex: [
            /^(smoke\s*)?weed(\s*every\s*day)?$/i,
            /^evre+\s*day$/i,
        ],
    },
    {
        files: ["bait.dat"],
        id: "BAIT",
        regex: [/^(that\'s\s*)?bait$/i],
    },
    {
        files: ["trap.dat"],
        id: "TRAP",
        regex: [/^(it\'?s\s*a\s*)?trap\!?$/i],
    },
    {
        files: ["triple.dat"],
        id: "TRIPLE",
        regex: [/^(oh\s*baby\s*a\s*)?triple\!?$/i],
    },
    {
        files: ["wakemeup.dat"],
        id: "CANTWAKEUP",
        regex: [
            /^wake\s*me\s*up(\s*inside)?(\s*\(can\'t\s*wake\s*up\))?$/i,
            /^\(?can\'t\s*wake\s*up\)?$/i,
        ],
    },
    {
        files: ["alarum.dat"],
        id: "ALARUM",
        regex: [
            /^alaru?m$/i,
            /^bwe+o+u*we+$/i,
        ],
    },
    {
        files: ["megumin.dat"],
        id: "MEGUMIN",
        regex: [
            /^megumin$/i,
            /^めぐみん$/i,
            /^EXPLO+SION$/i,
        ],
    },
]
