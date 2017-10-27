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
        "id": "OSTRICH",
        "files": ["ostrich.mp3"],
        "regex": [/^haha\!?$/i, /^ostrich$/i]
    },
    {
        "id": "THEBEST4",
        "files": ["thebest4.mp3"],
        "regex": [/^the\s?best$/i],
        "fallbackImageURL": "https://cdn.discordapp.com/attachments/293954139845820416/373612584722628608/thebest.gif"
    },
    {
        "id": "ENYA",
        "files": ["enya.mp3"],
        "regex": [/^enya$/i, /^only\s?time$/i, /^enya\s-*\sonly\stime$/i]
    },
    {
        "id": "DEADINSIDE",
        "files": ["deadinside.mp3"],
        "regex": [/^dead\sinside$/i]
    },
    {
        "id": "OHJEEZ",
        "files": ["ohjeez.mp3"],
        "regex": [/^o+h+ [gj]ee+z+$/i]
    },
    {
        "id": "OHBEES",
        "files": ["ohbees.mp3"],
        "regex": [/^o+h+ [b]ee+s$/i]
    },
    {
        "id": "UNTITLED",
        "files": ["untitled.mp3"],
        "regex": [
            /^untitled$/i,
            /^simple\s+plan$/i,
            /^how\s*could\s*this\s*happen\s*to\s*me\??$/i
        ]
    },
    {
        "id": "20PERCENTCOOLER",
        "files": ["20cooler.mp3"],
        "regex": [/^20%\s*cooler$/i, /^twenty\s*percent\s*cooler$/i]
    },
    {
        "id": "HUEYS",
        "files": ["hueys.mp3"],
        "regex": [/^(distant[\s]+)?(hu(ey|ie)s|chopper(s?))$/i]
    },
    {
        "id": "SADVIOLIN",
        "files": ["sadviolin.mp3"],
        "regex": [/^(sad|tiny)[\s]+violins?$/i]
    },
    {
        "id": "SOUNDOFSILENCE",
        "files": ["silence.mp3"],
        "regex": [
            /^hello da?rk(ness)?( my old friend)?$/i,
            /^sound of silence$/
        ]
    },
    {
        "id": "DUNDUNDUNN",
        "files": ["dundundunn.mp3"],
        "regex": [
            /^dun\s*dun\s*dun+$/
        ]
    },
    {
        "id": "PUSSIEEEEE",
        "files": ["pussieeeee.mp3"],
        "regex": [
            /^((i'll have you know)? (that )?there's no )?pu+ss+i+e+?$/i,
        ]
    },
    {
        "id": "WEED",
        "files": ["weed.mp3"],
        "regex": [
            /^(smoke\s*)?weed(\s*every\s*day)?$/i,
            /^evre+\s*day$/i
        ]
    },
    {
        "id": "BAIT",
        "files": ["bait.mp3"],
        "regex": [/^(that\'s\s*)?bait$/i]
    },
    {
        "id": "TRAP",
        "files": ["trap.mp3"],
        "regex": [/^(it\'?s\s*a\s*)?trap\!?$/i]
    },
    {
        "id": "TRIPLE",
        "files": ["triple.mp3"],
        "regex": [/^(oh\s*baby\s*a\s*)?triple\!?$/i]
    },
    {
        "id": "CANTWAKEUP",
        "files": ["wakemeup.mp3"],
        "regex": [
            /^wake\s*me\s*up(\s*inside)?(\s*\(can\'t\s*wake\s*up\))?$/i,
            /^\(?can\'t\s*wake\s*up\)?$/i
        ]
    },
    {
        "id": "ALARUM",
        "files": ["alarum.mp3"],
        "regex": [
            /^alaru?m$/i,
            /^bwe+o+u*we+$/i
        ]
    },
    {
        "id": "MEGUMIN",
        "files": ["megumin.mp3"],
        "regex": [
            /^megumin$/i,
            /^めぐみん$/i,
            /^EXPLO+SION$/i
        ]
    }
]

