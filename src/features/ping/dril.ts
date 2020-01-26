/**
 * Pipe steaming hot @dril tweets directly from Hell into your squad chat
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 01/04/17.
 * Copyright (c) 2017 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { Brain } from "../../brain"

const NEVER = "https://twitter.com/dril/status/247222360309121024"
const NO = "https://twitter.com/dril/status/922321981"
const BRAIN_KEYS = {
    TOOT_LIST: "dril:toot_list",
}

const TOOTS = [
    "https://twitter.com/dril/status/26334898832",
    "https://twitter.com/dril/status/10849247486287872",
    "https://twitter.com/dril/status/34912332027011072",
    "https://twitter.com/dril/status/247222360309121024",
    "https://twitter.com/dril/status/795712640593104904",
    "https://twitter.com/dril/status/767124342157221897",
    "https://twitter.com/dril/status/763449869143072768",
    "https://twitter.com/dril/status/757845760645804032",
    "https://twitter.com/dril/status/747887870254383104",
    "https://twitter.com/dril/status/743422792801071104",
    "https://twitter.com/dril/status/719606665021169666",
    "https://twitter.com/dril/status/621402757606445056",
    "https://twitter.com/dril/status/615199946980110336",
    "https://twitter.com/dril/status/602977501749616642",
    "https://twitter.com/dril/status/361282749086175234",
    "https://twitter.com/dril/status/685244467213897728",
    "https://twitter.com/dril/status/516183352106577920",
    "https://twitter.com/dril/status/384408932061417472",
    "https://twitter.com/dril/status/514845232509501440",
    "https://twitter.com/dril/status/490366979749216256",
    "https://twitter.com/dril/status/398879478912258048",
    "https://twitter.com/dril/status/757914951868485632",
    "https://twitter.com/dril/status/473706394009759744",
    "https://twitter.com/dril/status/213849618415484929",
    "https://twitter.com/dril/status/216374968093650944",
    "https://twitter.com/dril/status/228886158501896192",
    "https://twitter.com/dril/status/128618655989776385",
    "https://twitter.com/dril/status/216036653423267841",
    "https://twitter.com/dril/status/199317160059875328",
    "https://twitter.com/dril/status/234636796288450560",
    "https://twitter.com/dril/status/204379513575055360",
    "https://twitter.com/dril/status/178191539959377920",
    "https://twitter.com/dril/status/179736293641682944",
    "https://twitter.com/dril/status/197502223226384387",
    "https://twitter.com/dril/status/181225396694560769",
    "https://twitter.com/dril/status/205052027259195393",
    "https://twitter.com/dril/status/216930169028476928",
    "https://twitter.com/dril/status/158042815128023040",
    "https://twitter.com/dril/status/228881278143967232",
    "https://twitter.com/dril/status/213844275102883840",
    "https://twitter.com/dril/status/107911000199671808",
    "https://twitter.com/dril/status/176512142944636929",
    "https://twitter.com/dril/status/190943080730472448",
    "https://twitter.com/dril/status/223751039709495298",
    "https://twitter.com/dril/status/182955342995525632",
    "https://twitter.com/dril/status/323091933197115393",
    "https://twitter.com/dril/status/715139916246552576",
    "https://twitter.com/dril/status/734307632375336960",
    "https://twitter.com/dril/status/760997832237129729",
    "https://twitter.com/dril/status/545926930982502400",
    "https://twitter.com/dril/status/708292373802065921",
    "https://twitter.com/dril/status/545789616738287616",
    "https://twitter.com/dril/status/545632785537716226",
    "https://twitter.com/dril/status/545623780505427969",
    "https://twitter.com/dril/status/545622084865769476",
    "https://twitter.com/dril/status/545620013500346369",
    "https://twitter.com/dril/status/545619381657812992",
    "https://twitter.com/dril/status/545618510609920000",
    "https://twitter.com/dril/status/545617546796605440",
    "https://twitter.com/dril/status/331216421013049344",
    "https://twitter.com/dril/status/331220734250725376",
    "https://twitter.com/dril/status/331223511962107904",
    "https://twitter.com/dril/status/348547842761170944",
    "https://twitter.com/dril/status/539099548548079617",
    "https://twitter.com/dril/status/521873409316487169",
    "https://twitter.com/dril/status/604324414335905792",
    "https://twitter.com/dril/status/171450835388203008",
    "https://twitter.com/dril/status/361282749086175234",
    "https://twitter.com/dril/status/396296773964017665",
    "https://twitter.com/dril/status/256431328592011266",
    "https://twitter.com/dril/status/575121631846227968",
    "https://twitter.com/dril/status/383740993637343232",
    "https://twitter.com/dril/status/504134967946141697",
    "https://twitter.com/dril/status/496077711434330113",
    "https://twitter.com/dril/status/831805955402776576",
    "https://twitter.com/dril/status/653978129749426176",
    "https://twitter.com/dril/status/344941923351527424",
    "https://twitter.com/dril/status/508470830981218304",
    "https://twitter.com/dril/status/843885268805599232",
    "https://twitter.com/dril/status/464802196060917762",
    "https://twitter.com/dril/status/779812111249772544",
    "https://twitter.com/dril/status/598672627515916288",
    "https://twitter.com/dril/status/346647087527624704",
    "https://twitter.com/dril/status/383740993637343232",
    "https://twitter.com/dril/status/305345947121094656",
    "https://twitter.com/dril/status/326384487120375808",
    "https://twitter.com/dril/status/256795162993377280",
    "https://twitter.com/dril/status/521873409316487169",
    "https://twitter.com/dril/status/330795580735500290",
    "https://twitter.com/dril/status/12295173117",
    "https://twitter.com/dril/status/178870574335004672",
    "https://twitter.com/dril/status/367337623573901313",
    "https://twitter.com/dril/status/369997365983195136",
    "https://twitter.com/dril/status/717156281669271552",
    "https://twitter.com/dril/status/892825482814771203",
    "https://twitter.com/dril/status/134268900559949824",
    "https://twitter.com/dril/status/586176331085438976",
    "https://twitter.com/dril/status/993006582874169345",
    "https://twitter.com/dril/status/233188063914889216",
    "https://twitter.com/dril/status/830105130104127490",
    "https://twitter.com/dril/status/15269318182",
    "https://twitter.com/dril/status/593017471172382720",
]

function shuffle<T>(a: T[]): T[] {
    let j = 0
    let i = 0

    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        const x = a[i]
        a[i] = a[j]
        a[j] = x
    }

    return a
}

export class Dril {
    public constructor(
        public brain: Brain,
    ) { }

    public async getTweets(channelId: string, count: number): Promise<string[]> {
        let toots: string[] = []
        const selected: string[] = []
        try {
            const tootsJSONStr = await this.brain.get(this.brainKeyForChannel(channelId))
            if (tootsJSONStr) {
                toots = JSON.parse(tootsJSONStr)
            } else {
                toots = shuffle(TOOTS.slice(0))
            }
        } catch (err) {
            toots = shuffle(TOOTS.slice(0))
        }
        while (selected.length < count) {
            if (toots.length === 0) {
                toots = shuffle(TOOTS.slice(0))
            }

            const tweet = toots.pop() || ""
            selected.push(tweet)
        }
        await this.brain.set(this.brainKeyForChannel(channelId), JSON.stringify(toots))
        return selected
    }

    public getNo(): string {
        return NO
    }

    public logoff(): string {
        return NEVER
    }

    private brainKeyForChannel(chanId: string) {
        return `${BRAIN_KEYS.TOOT_LIST}:${chanId}`
    }
}
