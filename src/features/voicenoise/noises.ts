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
        files: ["ostrich.opus"],
        id: "OSTRICH",
        regex: [/^haha\!?$/i, /^ostrich$/i],
    },
    {
        fallbackImageURL: "https://cdn.discordapp.com/attachments/293954139845820416/373612584722628608/thebest.gif",
        files: ["thebest4.opus"],
        id: "THEBEST4",
        regex: [/^the\s?best$/i],
    },
    {
        files: ["enya.opus"],
        id: "ENYA",
        regex: [/^enya$/i, /^only\s?time$/i, /^enya\s-*\sonly\stime$/i],
    },
    {
        files: ["deadinside.opus"],
        id: "DEADINSIDE",
        regex: [/^dead\sinside$/i],
    },
    {
        files: ["ohjeez.opus"],
        id: "OHJEEZ",
        regex: [/^o+h+ [gj]ee+z+$/i],
    },
    {
        files: ["ohbees.opus"],
        id: "OHBEES",
        regex: [/^o+h+ [b]ee+s$/i],
    },
    {
        files: ["untitled.opus"],
        id: "UNTITLED",
        regex: [
            /^untitled$/i,
            /^simple\s+plan$/i,
            /^how\s*could\s*this\s*happen\s*to\s*me\??$/i,
        ],
    },
    {
        files: ["hueys.opus"],
        id: "HUEYS",
        regex: [/^(distant[\s]+)?(hu(ey|ie)s|chopper(s?))$/i],
    },
    {
        files: ["sadviolin.opus"],
        id: "SADVIOLIN",
        regex: [/^(sad|tiny)[\s]+violins?$/i],
    },
    {
        files: ["silence.opus"],
        id: "SOUNDOFSILENCE",
        regex: [
            /^hello da?rk(ness)?( my old friend)?$/i,
            /^sound of silence$/,
        ],
    },
    {
        files: ["dundundunn.opus"],
        id: "DUNDUNDUNN",
        regex: [
            /^dun\s*dun\s*dun+$/,
        ],
    },
    {
        files: ["pussieeeee.opus"],
        id: "PUSSIEEEEE",
        regex: [
            /^((i'll have you know)? (that )?there's no )?pu+ss+i+e+?$/i,
        ],
    },
    {
        files: ["weed.opus"],
        id: "WEED",
        regex: [
            /^(smoke\s*)?weed(\s*every\s*day)?$/i,
            /^evre+\s*day$/i,
        ],
    },
    {
        files: ["bait.opus"],
        id: "BAIT",
        regex: [/^(that\'s\s*)?bait$/i],
    },
    {
        files: ["trap.opus"],
        id: "TRAP",
        regex: [/^(it\'?s\s*a\s*)?trap\!?$/i],
    },
    {
        files: ["triple.opus"],
        id: "TRIPLE",
        regex: [/^(oh\s*baby\s*a\s*)?triple\!?$/i],
    },
    {
        files: ["wakemeup.opus"],
        id: "CANTWAKEUP",
        regex: [
            /^wake\s*me\s*up(\s*inside)?(\s*\(can\'t\s*wake\s*up\))?$/i,
            /^\(?can\'t\s*wake\s*up\)?$/i,
        ],
    },
    {
        files: ["alarum.opus"],
        id: "ALARUM",
        regex: [
            /^alaru?m$/i,
            /^bwe+o+u*we+$/i,
        ],
    },
    {
        files: ["megumin.opus"],
        id: "MEGUMIN",
        regex: [
            /^megumin$/i,
            /^めぐみん$/i,
            /^EXPLO+SION$/i,
        ],
    },
    {
        files: ["keepup.dat"],
        id: "KEEPUP",
        regex: [
            /^keep\s*up(\s*m[uo]th(er|a)fuck(a|er))?$/i,
        ],
    },
    {
        files: ["airhorn_default.opus"],
        id: "AIRHORN",
        regex: [
            /^airhorn$/i,
        ],
    },
    {
        files: ["airhorn_tripletap.opus"],
        id: "AIRHORN_TRIPLETAP",
        regex: [
            /^(triple\s+)?airhorn(\s+triple)?$/i,
        ],
    },
    {
        files: ["jail.opus"],
        id: "JAIL",
        regex: [
            /^(i\'?m\s+goin[\'g]?\s+)?(to\s+)?jail$/i,
        ],
    },
    {
        files: ["hahgay.opus"],
        id: "HAHGAY",
        regex: [
            /^(hah\!?\s+)?ga+y+$/i,
        ],
    },
    {
        files: ["hiphop.opus"],
        id: "HIPHOP",
        regex: [
            /^(i\s+don\'?t\s+listen\s+to\s+)?hip\s*hop$/i,
        ],
    },
    {
        files: ["nerd.opus"],
        id: "NERD",
        regex: [
            /^ne+r+d+\!*$/i,
        ],
    },
    {
        files: ["leeroy.opus"],
        id: "LEEROY",
        regex: [
            /^le+r+o+y+\!*(\s+je+n+k+i+n+s+\!*)?$/i,
        ],
    },
    {
        files: ["brutalsavagerekt.opus"],
        id: "BRUTALSAVAGEREKT",
        regex: [
            /^(brutal\s+)?(savage\s+)?rekt$/i,
        ],
    },
    {
        files: ["noscope.opus"],
        id: "GETNOSCOPED",
        regex: [
            /^(get\s+)?no\s*scoped?$/i,
        ],
    },
    {
        files: ["mlg.opus"],
        id: "MLG1",
        regex: [
            /^mlg$/i,
        ],
    },
    {
        files: ["mii1.opus", "mii2.opus"],
        id: "MII",
        regex: [
            /^mii$/i,
        ],
    },
    {
        files: ["mad.opus"],
        id: "ITSONLYGAME",
        regex: [
            /^(it?\'?s\s+only\s+game\s+)?(why\s+you\s+)?(have|heff)\s+to\s+be\s+mad\??$/i,
        ],
    },
    {
        files: ["democracy.opus", "democracy2.opus", "democracy3.opus", "democracy4.opus"],
        id: "MANIFEST",
        regex: [
            /^democracy\s+manifest$/i,
            /^succulent\s+chinese\s+meal$/i,
        ],
    },
    {
        files: ["johnmadden.opus"],
        id: "ITSONLYGAME",
        regex: [
            /^john\s+madden$/i,
        ],
    },
]
