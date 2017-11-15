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
        "files": ["ostrich.dat"],
        "regex": [/^haha\!?$/i, /^ostrich$/i]
    },
    {
        "id": "THEBEST4",
        "files": ["thebest4.dat"],
        "regex": [/^the\s?best$/i],
        "fallbackImageURL": "https://cdn.discordapp.com/attachments/293954139845820416/373612584722628608/thebest.gif"
    },
    {
        "id": "ENYA",
        "files": ["enya.dat"],
        "regex": [/^enya$/i, /^only\s?time$/i, /^enya\s-*\sonly\stime$/i]
    },
    {
        "id": "DEADINSIDE",
        "files": ["deadinside.dat"],
        "regex": [/^dead\sinside$/i]
    },
    {
        "id": "OHJEEZ",
        "files": ["ohjeez.dat"],
        "regex": [/^o+h+ [gj]ee+z+$/i]
    },
    {
        "id": "OHBEES",
        "files": ["ohbees.dat"],
        "regex": [/^o+h+ [b]ee+s$/i]
    },
    {
        "id": "UNTITLED",
        "files": ["untitled.dat"],
        "regex": [
            /^untitled$/i,
            /^simple\s+plan$/i,
            /^how\s*could\s*this\s*happen\s*to\s*me\??$/i
        ]
    },
    {
        "id": "20PERCENTCOOLER",
        "files": ["20cooler.dat"],
        "regex": [/^20%\s*cooler$/i, /^twenty\s*percent\s*cooler$/i]
    },
    {
        "id": "HUEYS",
        "files": ["hueys.dat"],
        "regex": [/^(distant[\s]+)?(hu(ey|ie)s|chopper(s?))$/i]
    },
    {
        "id": "SADVIOLIN",
        "files": ["sadviolin.dat"],
        "regex": [/^(sad|tiny)[\s]+violins?$/i]
    },
    {
        "id": "SOUNDOFSILENCE",
        "files": ["silence.dat"],
        "regex": [
            /^hello da?rk(ness)?( my old friend)?$/i,
            /^sound of silence$/
        ]
    },
    {
        "id": "DUNDUNDUNN",
        "files": ["dundundunn.dat"],
        "regex": [
            /^dun\s*dun\s*dun+$/
        ]
    },
    {
        "id": "PUSSIEEEEE",
        "files": ["pussieeeee.dat"],
        "regex": [
            /^((i'll have you know)? (that )?there's no )?pu+ss+i+e+?$/i,
        ]
    },
    {
        "id": "WEED",
        "files": ["weed.dat"],
        "regex": [
            /^(smoke\s*)?weed(\s*every\s*day)?$/i,
            /^evre+\s*day$/i
        ]
    },
    {
        "id": "BAIT",
        "files": ["bait.dat"],
        "regex": [/^(that\'s\s*)?bait$/i]
    },
    {
        "id": "TRAP",
        "files": ["trap.dat"],
        "regex": [/^(it\'?s\s*a\s*)?trap\!?$/i]
    },
    {
        "id": "TRIPLE",
        "files": ["triple.dat"],
        "regex": [/^(oh\s*baby\s*a\s*)?triple\!?$/i]
    },
    {
        "id": "CANTWAKEUP",
        "files": ["wakemeup.dat"],
        "regex": [
            /^wake\s*me\s*up(\s*inside)?(\s*\(can\'t\s*wake\s*up\))?$/i,
            /^\(?can\'t\s*wake\s*up\)?$/i
        ]
    },
    {
        "id": "ALARUM",
        "files": ["alarum.dat"],
        "regex": [
            /^alaru?m$/i,
            /^bwe+o+u*we+$/i
        ]
    },
    {
        "id": "MEGUMIN",
        "files": ["megumin.dat"],
        "regex": [
            /^megumin$/i,
            /^めぐみん$/i,
            /^EXPLO+SION$/i
        ]
    }
]

