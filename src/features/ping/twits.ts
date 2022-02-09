/* eslint-disable max-len */
/**
 * Pipe best of twits directly into your squad chat
 */

/*
 * AetheBot - A Discord Chatbot
 *
 * Created by Tyrone Trevorrow on 05/08/20.
 * Copyright (c) 2020 Tyrone Trevorrow. All rights reserved.
 *
 * This source code is licensed under the permissive MIT license.
 */

import { TweetPoolContent, TweetPool } from "./tweetpool"
import { fetchCustomToots } from "./twit_this"

const BRAIN_KEYS = {
    TOOT_LIST: "twit:toot_list",
}


const CONTENT: TweetPoolContent[] = [
    {
        content: "Yeah I'm p good with the old Microsoft Office [i accidentally click the button that makes all the paragraph symbols appear] ah she's fucked",
        retweets: 1481,
        likes: 6565,
        url: "https://twitter.com/bea_ker/status/840061788351733760",
        author: "Bea_ker (@bea_ker)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740475457002012682/EONsIIb6_400x400.png",
    },
    {
        content: "The whole internet loves Milkshake Duck, a lovely duck that drinks milkshakes! \\*5 seconds later\\* We regret to inform you the duck is racist",
        retweets: 14340,
        likes: 38224,
        url: "https://twitter.com/pixelatedboat/status/741904787361300481",
        author: "pixelatedboat aka “mr tweets” (@pixelatedboat)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740477065123463218/hc8K1aT0_bigger.png",
    },
    {
        content: "“Sweet dreams you piece of shit.” I try to snap the prison guard’s neck but just make him look to the left very quickly.",
        retweets: 15776,
        likes: 45961,
        url: "https://twitter.com/vineyille/status/822814010185842688",
        author: "vineyille (@vineyille)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740480320087785472/TTZjmQNH_bigger.png",
    },
    {
        content: "Judge: Now wait a second Mike. if the other players were hacking, wouldn't that make their kills on you unfair?\nMe: That's right your honor.",
        retweets: 531,
        likes: 1820,
        url: "http://twitter.com/animaldrumss/status/491058831028678656",
        author: "Mike F (@mikefossey)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740483003515666452/unknown.png",
    },
    {
        content: "Akchally it’s an ancient Italian symbol dat represents da peaceful intasection of the four ingredients of a perfect Alfredo sauce",
        retweets: 1181,
        likes: 5898,
        url: "https://twitter.com/nycguidovoice/status/914531086977429504",
        author: "nYC Guido Voice (@nycguidovoice)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740483433024847912/KevZFIjk_400x400.png",
        image: "https://cdn.discordapp.com/attachments/550619622450135046/740483897577439343/DLERKcrV4AAvhQ3.png",
    },
    {
        content: "My name on valorant is mywifediedin2012 and in a game a few days ago a guy said “this one goes out to this dudes wife” then got a headshot",
        retweets: 3233,
        likes: 23404,
        url: "https://twitter.com/tomwalkerisgood/status/1286188390988181504",
        author: "TOM (@tomwalkerisgood)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740484282375733309/hBzLtmH_bigger.png",
    },
    {
        content: "SOCRATES: I am wiser than this man; he fancies he knows something, although he knows nothing—\nDARRYL, SOCRATES' FRIEND: fuck him up socrates",
        retweets: 40158,
        likes: 82981,
        url: "https://twitter.com/leyawn/status/585859882869469184",
        author: "leon (@leyawn)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740491796223885343/70e0971b8c52faf3a44fd9a6194c54f5_bigger.gif",
    },
    {
        content: "https://t.co/8HothQooBg",
        retweets: 4263,
        likes: 32036,
        url: "https://twitter.com/nocontextboomer/status/1283366754559950852",
        author: "Cropped Boomer Images (@NoContextBoomer)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740509840631398400/Clicc486_bigger.png",
        image: "https://cdn.discordapp.com/attachments/550619622450135046/740509718769827900/Ec9vQxhXYAk1Ug3.png",
    },
    {
        content: "https://t.co/kA7UMu4Mmz",
        retweets: 9858,
        likes: 50092,
        url: "https://twitter.com/mort/status/1280756378697641984",
        author: "mort (@mort)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740510566451380254/unknown.png",
        image: "https://cdn.discordapp.com/attachments/550619622450135046/740510726606815312/EcYpIQKX0AAxpLU.png",
    },
    {
        content: "\\*opens briefcase\\* shall we dispense with the small talk and get down to business?",
        retweets: 538,
        likes: 2260,
        url: "https://twitter.com/robotrowboat/status/1276630335288197123",
        author: "Troutman (@robotrowboat)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740511404167266414/0GEC33Y__bigger.png",
        image: "https://cdn.discordapp.com/attachments/550619622450135046/740511591081967664/EbeAdmhXYAE-FjJ.png",
    },
    {
        content: "If unemployment exceeds 30% and distrust of the political process becomes widespread, there is a danger that the United States will enter what historians call The Cool Zone.",
        retweets: 6767,
        likes: 31273,
        url: "https://twitter.com/SeanRMoorhead/status/1248065386714558465",
        author: "Ed Mubarak (@SeanRMoorhead)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740512740858396672/ojhF57p__bigger.png",
    },
    {
        content: "my roommate bansky is at it again. he made coffee and said he put something inside that would \"REALLY wake me up\"",
        retweets: 23710,
        likes: 46044,
        url: "https://twitter.com/electrolemon/status/489101252844736513",
        author: "demi adejuyigbe (@electrolemon)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740513457165697096/0Aa9lo1__bigger.png",
        image: "https://cdn.discordapp.com/attachments/550619622450135046/740513721050333226/Bsmi_1eCQAEBule.png",
    },
    {
        content: "https://t.co/jMZOnrjhxy",
        retweets: 2,
        likes: 11,
        url: "https://twitter.com/camtyeson/status/1257931864783765504",
        author: "Cam Tyeson (@camtyeson)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740515355625259028/ZgUS5Sxt_bigger.png",
        image: "https://cdn.discordapp.com/attachments/550619622450135046/740515256006082560/EXUSXB3VcAAtqie.png",
    },
    {
        content: "oh so all of a sudden you know how to use metric measurements",
        retweets: 98,
        likes: 1440,
        url: "https://twitter.com/AaronGocs/status/1256870506227105795",
        author: "Aaron Gocs (@AaronGocs)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740515973043454043/efb427f8f43ff1c7650b7a6cc2d36867_bigger.png",
        image: "https://cdn.discordapp.com/attachments/550619622450135046/740516644006395954/unknown.png",
    },
    {
        content: "[mysterious old lady flips tarot card revealing a dude who looks exactly like me flying a hot air balloon into power lines]\nMe: is that good",
        retweets: 42249,
        likes: 84781,
        url: "https://twitter.com/boring_as_heck/status/604761050857095168",
        author: "mr. peepee poopoo (@boring_as_heck)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740516343648092180/n0coWjbP_bigger.png",
    },
    {
        content: "me: Welcome to Troll Academy. First order of business, you have to pick a troll name which you will use all times at the school.\n(everyones hand goes up)\nme: The name cannot be a racial slur.\n(everyones hand goes down except one)\nme: No exceptions.\n(the last hand goes down)",
        retweets: 8,
        likes: 115,
        url: "https://twitter.com/getfiscal/status/982755131325403136",
        author: "Don Hughes 🦌 (@getfiscal)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740516953487048764/5nqTrvC0_bigger.png",
    },
    {
        content: "me: Alright that concludes my opening remarks on Troll Academy. Does anyone have any questions? Yes, you.\nstudent: Fuck you.\nme: Good. Anyone else? Yes.\nother student: You look like it a potato lost its job.\nme: Great. Troll Academy isn’t easy, and you’re stupid for signing up.",
        retweets: 4,
        likes: 35,
        url: "https://twitter.com/getfiscal/status/982766436077768704",
        author: "Don Hughes 🦌 (@getfiscal)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740516953487048764/5nqTrvC0_bigger.png",
    },
    {
        content: "Just to let everyone know I work in the 5G field.  While I was working from home this weekend I just realised I had all the units set to “give corona” setting instead of the default “make everyone gay” default setting. Really sorry about that.",
        retweets: 2383,
        likes: 12069,
        url: "https://twitter.com/NZjusticeSUCKS/status/1251941154494406656",
        author: "NZ Truth Warrior (@NZjusticeSUCKS)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740517353460334712/9Zmg1Bal_bigger.png",
    },
    {
        content: "i think i'd like to have one of those youtube channels where every video thumbnail is this bullshit",
        retweets: 5039,
        likes: 19544,
        url: "https://twitter.com/robwhisman/status/735281634656669696",
        author: "rob (@robwhisman)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740517652434518046/pojRP1iz_bigger.png",
        image: "https://cdn.discordapp.com/attachments/550619622450135046/740517674903142460/CjQ-v9oWgAAuoiO.png",
    },
    {
        content: "i see u know ur pinot well",
        retweets: 7,
        likes: 23,
        url: "https://twitter.com/robwhisman/status/735317544156991488",
        author: "a big pretty Lizard (@birdcardigan)",
        avatar: "https://cdn.discordapp.com/attachments/550619622450135046/740517908244856903/ZKzY7QRK_bigger.png",
        image: "https://cdn.discordapp.com/attachments/550619622450135046/740518221769080912/unknown.png",
    },
    {
        content: "god: i have made Mankind\nangels: you fucked up a perfectly good monkey is what you did. look at it. it's got anxiety",
        retweets: 50220,
        likes: 89131,
        url: "https://twitter.com/jon_snow_420/status/659443020908003328",
        author: "failings spectre (@jon_snow_420)",
        avatar: "https://cdn.discordapp.com/attachments/293954139845820416/921202881347072030/zoAyRuJP_normal.jpg",
    },
    {
        content: "Sci-Fi Author: In my book I invented the Torment Nexus as a cautionary tale\n\nTech Company: At long last, we have created the Torment Nexus from classic sci-fi novel Don't Create The Torment Nexus",
        retweets: 27409,
        likes: 102134,
        url: "https://twitter.com/AlexBlechman/status/1457842724128833538",
        author: "Alex Blechman (@AlexBlechman)",
        avatar: "https://cdn.discordapp.com/attachments/293954139845820416/921995248803127306/KhbtX6JF_bigger.png",
    },
    {
        content: "\\*Cracks Diet Pepsi Ahh...Refreshing Diet Peppi \\*Slowly Sips, Then Gulps, The Diet Pappo\\*\\* Ahh, Diet Parpo. Thank's To The Papor-Colla Corp.",
        retweets: 7373,
        likes: 15369,
        url: "https://twitter.com/tree_bro/status/79444819902074880",
        author: "Jackson (@tree_bro)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935753034443677786/BRO_bigger.jpg",
    },
    {
        content: "Hello sir, I-\\*briefcase full of jellybeans falls open\\*",
        retweets: 8469,
        likes: 22017,
        url: "https://twitter.com/brendlewhat/status/165631372327784448",
        author: "brendle (@brendlewhat)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935753703951073290/pZ4ZTsOU_bigger.png",
    },
    {
        content: "most cutting thing you can say is \"who's this clown?\" because it implies they're a) a clown & b) not even one of the better-known clowns",
        retweets: 71480,
        likes: 126859,
        url: "https://twitter.com/skullmandible/status/411281851131523072",
        author: "Cohen is a ghost (@skullmandible)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935754001981521950/Kw0VfgAV_bigger.jpg",
    },
    {
        content: "What should we call this giant advertising board?\nPHIL: A philboard\nBILL: I have a better idea",
        retweets: 11079,
        likes: 21428,
        url: "https://twitter.com/internethippo/status/585108383985836034",
        author: "The Borscht Identity (@InternetHippo)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935754402629845002/mV-fry51_bigger.jpg",
    },
    {
        content: "amazon: we shipped your package! it should deliver by 8pm tomorrow!\n\nme, nose pressed against the door, fogging the glass as i breathe: **𝗽𝗮𝗸𝗶𝗱𝗴𝗲**",
        retweets: 67330,
        likes: 284318,
        url: "https://twitter.com/sexhomaru/status/1108074779121197058",
        author: "rin | check pinned (@sexhomaru)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935755313628479498/KBJShADR_bigger.png",
        image: "https://cdn.discordapp.com/attachments/767671918505099294/935755614167109632/ENFoiFiXsAA_4bB.png",
    },
    {
        content: "[Dentist waiting room]\n\nMe: [chanting] teeth, teeth-\n\nOther patients: teeth, TEETH\n\nSecretary: [pounding her clipboard] TEETH, TEETH, TEETH!",
        retweets: 38270,
        likes: 121463,
        url: "https://twitter.com/lebeargirdle/status/898280833299230722",
        author: "brandAn is good (@LeBearGirdle)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935755841099956224/zKYF1c45_bigger.jpg",
    },
    {
        content: "democracy is this cool system where you yell at people online for 6 months and then people in Ohio and Florida pick the president",
        retweets: 12946,
        likes: 23868,
        url: "https://twitter.com/bromanconsul/status/742627660367429632",
        author: "bog person (@bromanconsul)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935756501467922492/erCOWmQt_bigger.jpg",
    },
    {
        content: "[quietly tries to open a can of beer]\ndriving instructor: what was that",
        retweets: 5797,
        likes: 14574,
        url: "https://twitter.com/cornonthegoblin/status/714202417944854528",
        author: "Cat Damon (@CornOnTheGoblin)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935756754082480128/7ncWKKow_bigger.jpeg",
    },
    {
        content: "One of McDonald's mascots is a guy who steals from McDonald's.",
        retweets: 1077,
        likes: 2382,
        url: "https://twitter.com/tylerschmall/status/443190789758132224",
        author: "Tyler Schmall (@tylerschmall)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935757032928182353/gCOEwKyC_bigger.jpg",
    },
    {
        content: "Day 20. Still lost at sea. Crew thinks I know how to plot a course with a protractor. I just like making it walk on the map. Pointy Leg Man.",
        retweets: 12659,
        likes: 33591,
        url: "https://twitter.com/vineyille/status/551873301963079680",
        author: "vineyille (@vineyille)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935757247320051792/TTZjmQNH_bigger.jpg",
    },
    {
        content: "Its really disgusting how other white people dont even know about the plight of [quickly wikipedias \"Who is having alot of plight 2012]",
        retweets: 2296,
        likes: 7941,
        url: "https://twitter.com/kanwetwitty/status/177549627090927616",
        author: "we (@kanwetwitty)",
        avatar: "https://cdn.discordapp.com/attachments/767671918505099294/935757468527628348/NjFHHWlu_bigger.jpg",
    },
]

export const TOOTS_BY_ID = new Map(CONTENT.map(obj => {
    const url = new URL(obj.url)
    const pathComponents = url.pathname.split("/")
    if (url.host !== "twitter.com") {
        throw new Error("idiot developer error: tweet urls must be on twitter dot com")
    }
    return [pathComponents[pathComponents.length - 1], obj]
}))

export class Twit extends TweetPool {
    protected async fetchList(): Promise<Map<string, TweetPoolContent>> {
        const builtins = TOOTS_BY_ID
        const customsObj = await fetchCustomToots(this.brain)
        const customs = new Map(Object.entries(customsObj))
        for (const [key, value] of builtins) {
            customs.set(key, value)
        }
        return customs
    }

    protected get persistenceVersion(): number {
        return 2
    }

    protected brainKeyForChannel(chanId: string): string {
        return `${BRAIN_KEYS.TOOT_LIST}:${chanId}`
    }
}
