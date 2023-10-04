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
    id: string
    files: string[]
    regex: RegExp[]
    fallbackImageURL?: string
    desc?: string
}

export const NOISES: Noise[] = [
    {
        files: ["ostrich.opus"],
        id: "OSTRICH",
        regex: [/^haha\!?$/i, /^ostrich$/i],
        desc: "Family guy ostrich.",
    },
    {
        fallbackImageURL: "https://tyrone-sudeium.github.io/aethebot-static/res/thebest.gif",
        files: ["thebest4.opus"],
        id: "THEBEST4",
        regex: [/^the\s?best$/i],
        desc: "THE BEST THE BEST THE BEST.",
    },
    {
        files: ["enya.opus"],
        id: "ENYA",
        regex: [/^enya$/i, /^only\s?time$/i, /^enya\s-*\sonly\stime$/i],
        desc: "Who can say where the road goes.",
    },
    {
        files: ["deadinside.opus"],
        id: "DEADINSIDE",
        regex: [/^dead\sinside$/i],
        desc: "DEAD INSIDE sting from Muse's DEAD INSIDE.",
    },
    {
        files: ["ohjeez.opus"],
        id: "OHJEEZ",
        regex: [/^o+h+ [gj]ee+z+$/i],
        desc: "Mr Garrison says \"Oh Jeez.\".",
    },
    {
        files: ["ohbees.opus"],
        id: "OHBEES",
        regex: [/^o+h+ [b]ee+s$/i],
        desc: "Bees.",
    },
    {
        files: ["untitled.opus"],
        id: "UNTITLED",
        regex: [
            /^untitled$/i,
            /^simple\s+plan$/i,
            /^how\s*could\s*this\s*happen\s*to\s*me\??$/i,
        ],
        desc: "How could this happen to me.",
    },
    {
        files: ["hueys.opus"],
        id: "HUEYS",
        regex: [/^(distant[\s]+)?(hu(ey|ie)s|chopper(s?))$/i],
        desc: "The sound of distant hueys.",
    },
    {
        files: ["sadviolin.opus"],
        id: "SADVIOLIN",
        regex: [/^(sad|tiny)[\s]+violins?$/i],
        desc: "Sad violin is very sad.",
    },
    {
        files: ["silence.opus"],
        id: "SOUNDOFSILENCE",
        regex: [
            /^hello da?rk(ness)?( my old friend)?$/i,
            /^sound of silence$/,
        ],
        desc: "Hello darkness my old friend.",
    },
    {
        files: ["dundundunn.opus"],
        id: "DUNDUNDUNN",
        regex: [
            /^dun\s*dun\s*dun+$/,
        ],
        desc: "DUN DUN DUN.",
    },
    {
        files: ["pussieeeee.opus"],
        id: "PUSSIEEEEE",
        regex: [
            /^((i'll have you know)? (that )?there's no )?pu+ss+i+e+?$/i,
        ],
        desc: "I'll have you know that there's no pussieeeee (in the cloud district).",
    },
    {
        files: ["weed.opus"],
        id: "WEED",
        regex: [
            /^(smoke\s*)?weed(\s*every\s*day)?$/i,
            /^evre+\s*day$/i,
        ],
        desc: "Timeless advice from Snoop Dogg.",
    },
    {
        files: ["bait.opus"],
        id: "BAIT",
        regex: [/^(that\'s\s*)?bait$/i],
        desc: "Uh uh. That's bait.",
    },
    {
        files: ["trap.opus"],
        id: "TRAP",
        regex: [/^(it\'?s\s*a\s*)?trap\!?$/i],
        desc: "It's a trap!",
    },
    {
        files: ["triple.opus"],
        id: "TRIPLE",
        regex: [/^(oh\s*baby\s*a\s*)?triple\!?$/i],
        desc: "Oh baby a triple!",
    },
    {
        files: ["wakemeup.opus"],
        id: "CANTWAKEUP",
        regex: [
            /^wake\s*me\s*up(\s*inside)?(\s*\(can\'t\s*wake\s*up\))?$/i,
            /^\(?can\'t\s*wake\s*up\)?$/i,
        ],
        desc: "Wake me up inside (can't wake up).",
    },
    {
        files: ["alarum.opus"],
        id: "ALARUM",
        regex: [
            /^alaru?m$/i,
            /^bwe+o+u*we+$/i,
        ],
        desc: "Alarum goes bweeoooweee.",
    },
    {
        files: ["megumin.opus"],
        id: "MEGUMIN",
        regex: [
            /^megumin$/i,
            /^めぐみん$/i,
            /^EXPLO+SION$/i,
        ],
        desc: "EXPLOOOOOOOOSION! (warn: loud)",
    },
    {
        files: ["keepup.opus"],
        id: "KEEPUP",
        regex: [
            /^keep\s*up(\s*m[uo]th(er|a)fuck(a|er))?$/i,
        ],
        desc: "Ryder demands that you keep up, with colourful language.",
    },
    {
        files: ["airhorn_default.opus"],
        id: "AIRHORN",
        regex: [
            /^airhorn$/i,
        ],
        desc: "One airhorn.",
    },
    {
        files: ["airhorn_tripletap.opus"],
        id: "AIRHORN_TRIPLETAP",
        regex: [
            /^(triple\s+)?airhorn(\s+triple)?$/i,
        ],
        desc: "Three airhorns.",
    },
    {
        files: ["jail.opus"],
        id: "JAIL",
        regex: [
            /^(i\'?m\s+goin[\'g]?\s+)?(to\s+)?jail$/i,
        ],
        desc: "I'm going to jail!",
    },
    {
        files: ["hahgay.opus"],
        id: "HAHGAY",
        regex: [
            /^(hah\!?\s+)?ga+y+$/i,
        ],
        desc: "Chang from Community thinks that's gayyyyyyyy.",
    },
    {
        files: ["hiphop.opus"],
        id: "HIPHOP",
        regex: [
            /^(i\s+don\'?t\s+listen\s+to\s+)?hip\s*hop$/i,
        ],
        desc: "The army general from South Park doesn't listen to hip hop.",
    },
    {
        files: ["nerd.opus"],
        id: "NERD",
        regex: [
            /^ne+r+d+\!*$/i,
        ],
        desc: "Homer thinks you're a nerd.",
    },
    {
        files: ["leeroy.opus"],
        id: "LEEROY",
        regex: [
            /^le+r+o+y+\!*(\s+je+n+k+i+n+s+\!*)?$/i,
        ],
        desc: "Time's up, let's do this! LEEEEEEROY JENKINS!",
    },
    {
        files: ["brutalsavagerekt.opus"],
        id: "BRUTALSAVAGEREKT",
        regex: [
            /^(brutal\s+)?(savage\s+)?rekt$/i,
        ],
        desc: "Redeye has opinions about how destroyed your team got in the last match.",
    },
    {
        files: ["noscope.opus"],
        id: "GETNOSCOPED",
        regex: [
            /^(get\s+)?no\s*scoped?$/i,
        ],
        desc: "GET NO SCOPED!",
    },
    {
        files: ["mlg.opus"],
        id: "MLG1",
        regex: [
            /^mlg$/i,
        ],
        desc: "MLG montage screaming.",
    },
    {
        files: ["mii1.opus", "mii2.opus"],
        id: "MII",
        regex: [
            /^mii$/i,
        ],
        desc: "Various stings from the Mii channel music.",
    },
    {
        files: ["mad.opus"],
        id: "ITSONLYGAME",
        regex: [
            /^(it?\'?s\s+only\s+game\s+)?(why\s+you\s+)?(have|heff)\s+to\s+be\s+mad\??$/i,
        ],
        desc: "It's only game. Why you heff to be mad?",
    },
    {
        files: ["democracy.opus", "democracy2.opus", "democracy3.opus", "democracy4.opus"],
        id: "MANIFEST",
        regex: [
            /^democracy\s+manifest$/i,
            /^succulent\s+chinese\s+meal$/i,
        ],
        desc: "Police interrupt a succulent chinese meal. This is democracy manifest.",
    },
    {
        files: ["johnmadden.opus"],
        id: "JOHNMADDEN",
        regex: [
            /^john\s+madden$/i,
        ],
        desc: "Moonbase Alpha provides a realistic simulation of life on a natural satellite.",
    },
    {
        files: ["cbt.opus"],
        id: "CBT",
        regex: [
            /^c(ognitive\s+)?b(ehavio(u?)ral\s+)?t(herapy)?$/i,
        ],
        desc: "Torture's bad.",
    },
    {
        files: ["hycybh.opus"],
        id: "HYCYBH",
        regex: [
            /^hycybh$/i,
            /^pooper$/i,
            /^have\s+you\s+checked\s+your\s+(butthole|pooper)$/i,
        ],
        desc: "Have you checked your butthole?",
    },
]
