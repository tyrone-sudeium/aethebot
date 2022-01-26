/* eslint-disable max-len */
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

import randomNumber from "random-number-csprng"
import { TweetPool, TweetPoolContent } from "./tweetpool"

const NEVER: CursedDrilContent = {
    content: "who the fuck is scraeming \"LOG OFF\" at my house. show yourself, coward. i will never log off",
    retweets: 15990,
    likes: 31988,
    id: "247222360309121024",
}

const NO: CursedDrilContent = {
    content: "no",
    retweets: 59902,
    likes: 118179,
    id: "922321981",
}

const GEANS = "https://media.discordapp.net/attachments/293954139845820416/674437889693843476/image0.jpg"

const BEERVIRUS: CursedDrilContent = {
    content: "ive flattened the curve over 100 times. what have you pricks been doing",
    retweets: 7378,
    likes: 60731,
    id: "1242643171462402049",
}

const DRIL_ICON = "https://cdn.discordapp.com/attachments/293954139845820416/697810031256666152/VXyQHfn0_bigger.jpg"
const BRAIN_KEYS = {
    TOOT_LIST: "dril:toot_list",
}

export interface CursedDrilContent {
    content: string
    retweets: number
    likes: number
    id: string
}

const NASA: CursedDrilContent[] = [
    {
        content: "Let's cut the crap—regarding iTunes. Maybe it's just me, but it seems like you gotta be from NASA just to get half these features to work.",
        retweets: 790,
        likes: 1730,
        id: "545926930982502400",
    },
    {
        content: "i tell you folks this damn itunes is something that you cant figure out unless you are a nasa guy",
        retweets: 2297,
        likes: 5106,
        id: "708292373802065921",
    },
    {
        content: "(in perfect astronnaut voice) bleep bloop even I cant figure out how to use damn itunes and im from Nasa",
        retweets: 1823,
        likes: 3511,
        id: "545789616738287616",
    },
    {
        content: "i gotta tell you, itunes is running me ragged. i reckon it would require the expertise of a NASA astronaut to operate this infernal program.",
        retweets: 805,
        likes: 1613,
        id: "545632785537716226",
    },
    {
        content: "ME: itunes, play some sinatra\nITUNES: Youre not authorized to operate itunes. Please insert NASA identification\nME: what hath ,been wrought!",
        retweets: 1494,
        likes: 3160,
        id: "545623780505427969",
    },
    {
        content: "folks let me tell you about the content platform known as \"itunes\". its so poorly conceived its even got nasas top men scratchin their heads",
        retweets: 834,
        likes: 1825,
        id: "545622084865769476",
    },
    {
        content: "some times I have a hard time playing my favorite songs on itunes, and I wish I had my astronaut's degree from nasa to help me play it !!",
        retweets: 798,
        likes: 1675,
        id: "545620013500346369",
    },
    {
        content: "itunes has more buttons & clickers than a space rocket, its like you got to be an astronaut from nasa to use it and not a normal man as I am",
        retweets: 1182,
        likes: 2621,
        id: "545619381657812992",
    },
    {
        content: "the itunes program is so complicated its like you gotta have a degree from nasa just to play sweet home Alabama.",
        retweets: 2116,
        likes: 3867,
        id: "545618510609920000",
    },
    {
        content: "itunes.. what a mix-up. its like you gotta be a NASA astronaut just to work this thing",
        retweets: 837,
        likes: 1739,
        id: "545617546796605440",
    },
    {
        content: "heads up hotshot. gonna drop two fuckin cents on this fuckin itunes. yeah you gotta be a fuckin nasa astronaut to use this shit. yea alright",
        retweets: 570,
        likes: 1437,
        id: "545788766779355136",
    },
]

const CONTENT: CursedDrilContent[] = [
    {
        content: "Welcome to the citadel of eternal wisdom.  Behold, this crystal contains the sum of all human knowledge -- Except Rap And Country",
        retweets: 3136,
        likes: 5871,
        id: "26334898832",
    },
    {
        content: "icant come to work today.. on account of JERRY DUTY SHoves every seinfeld disk into dvd player at once",
        retweets: 2223,
        likes: 3741,
        id: "10849247486287872",
    },
    {
        content: "Imagine. A world where guns come out of the ground like plants. And all the water is replaced by Bullet's. This is Gun World. It's real",
        retweets: 2516,
        likes: 4905,
        id: "34912332027011072",
    },
    {
        content: "the worst part of having an ass is always, having to wipe the damn thing. the best part of having an ass is shitting. #ElectionFinalThoughts",
        retweets: 1960,
        likes: 6252,
        id: "795712640593104904",
    },
    {
        content: "when you're sitting on the toilet theres a tiny opening between the seat and your dick/nut area. this is known as \"The Daredevil's Spittoon\"",
        retweets: 4251,
        likes: 16316,
        id: "767124342157221897",
    },
    {
        content: "im afraid you do not grasp the enormity of who it is you are dealing with. (removes diaper,. revealing two sub-diapers ) Shall we continue..",
        retweets: 2808,
        likes: 8224,
        id: "763449869143072768",
    },
    {
        content: "everybody wants to be the guy to write the tweet that solves racism once and for all because it would look good as hell on a resume",
        retweets: 3280,
        likes: 9007,
        id: "757845760645804032",
    },
    {
        content: "\"History will show that Brexit was the correct choice, for the future of Great Britain. I also do not believe in sex.\" - The_Brexit_Asexual",
        retweets: 1767,
        likes: 4874,
        id: "747887870254383104",
    },
    {
        content: "BLATHERING SHITE: the Dems VP Pick should be subway;s own Jared\nME: That man is in jail. Have you done any research prior to this discussion",
        retweets: 937,
        likes: 3885,
        id: "743422792801071104",
    },
    {
        content: "i am developing a ground brekaing new app called \"MOneyWallet\", where you earn \"Money Points\" by mailing cash to my house",
        retweets: 2800,
        likes: 6099,
        id: "719606665021169666",
    },
    {
        content: "When you \"FAve\" me, you are effectively throwing a \" Treat \" into my mouth",
        retweets: 6668,
        likes: 16012,
        id: "621402757606445056",
    },
    {
        content: "donlad trump reportedly says that normal type pokemon are a waste of time. they're just dirty birds & rats who have no right being a pokemon",
        retweets: 8266,
        likes: 12446,
        id: "615199946980110336",
    },
    {
        content: "TWITTER APP: THree different guys you know just faved the same damn tweet. This is breathtaking. What are the odds\nME: please locate my wife",
        retweets: 4282,
        likes: 9221,
        id: "602977501749616642",
    },
    {
        content: "if your grave doesnt say \"rest in peace\" on it you are automatically drafted into the skeleton war",
        retweets: 35501,
        likes: 61611,
        id: "361282749086175234",
    },
    {
        content: "DOCTOR: you cant keep doing this to yourself. being The Last True Good Boy online will destroy you. you must stop posting with honor\nME: No,",
        retweets: 4748,
        likes: 10870,
        id: "685244467213897728",
    },
    {
        content: "THERAPIST: your problem is, that youre perfect, and everyone is jealous of your good posts, and that makes you rightfully upset.\nME: I agree",
        retweets: 18822,
        likes: 33376,
        id: "516183352106577920",
    },
    {
        content: "Food $200\nData $150\nRent $800\nCandles $3,600\nUtility $150\nsomeone who is good at the economy please help me budget this. my family is dying",
        retweets: 60828,
        likes: 113062,
        id: "384408932061417472",
    },
    {
        content: "it is with a heavy heart that i must announce that the celebs are at it again",
        retweets: 19404,
        likes: 36275,
        id: "514845232509501440",
    },
    {
        content: "awfully bold of you to fly the Good Year blimp on a year that has been extremely bad thus far",
        retweets: 26158,
        likes: 38727,
        id: "490366979749216256",
    },
    {
        content: "big bird was obviously just a man in a suit. but the other ones were too small to contain men. so what the fuck",
        retweets: 25227,
        likes: 54048,
        id: "398879478912258048",
    },
    {
        content: "so long suckers! i rev up my motorcylce and create a huge cloud of smoke. when the cloud dissipates im lying completely dead on the pavement",
        retweets: 34536,
        likes: 61309,
        id: "757914951868485632",
    },
    {
        content: "blocked. blocked. blocked. youre all blocked. none of you are free of sin",
        retweets: 30562,
        likes: 34225,
        id: "473706394009759744",
    },
    {
        content: "\"This Whole Thing Smacks Of Gender,\" i holler as i overturn my uncle's barbeque grill and turn the 4th of July into the 4th of Shit",
        retweets: 22024,
        likes: 33314,
        id: "213849618415484929",
    },
    {
        content: "the blue thumnbtacks on this map indicate concentrations of high 月(luna) energy, the red ones are all the panera breads ive been banned from",
        retweets: 2426,
        likes: 5059,
        id: "216374968093650944",
    },
    {
        content: "fat nude man in guy fawkes mask sucked up by jet engine while doing jumping jacks on runway. the olympics have been cancelled in his honor",
        retweets: 515,
        likes: 938,
        id: "228886158501896192",
    },
    {
        content: "im the guy who airbrushes the nipples out of pro wrestling ads. i make $85k a year. but i have a secret \\*removs shades to reveal nipple eyes",
        retweets: 874,
        likes: 1663,
        id: "128618655989776385",
    },
    {
        content: "well i was going to climb mount everest but this yelp review says theres a nude man at the summit swinging chains around and yelling \"fuck u",
        retweets: 749,
        likes: 1740,
        id: "216036653423267841",
    },
    {
        content: "priest plugs my coffin in at the end of the funeral. \"MILLERTIME\" lights up in neon on the side, desecrating my corspe & sending me to hell",
        retweets: 794,
        likes: 1780,
        id: "199317160059875328",
    },
    {
        content: "as a small business owner i think its bulshit that i have to give 30% of my income to Spain just because obama lost a swordfight to some Fag",
        retweets: 706,
        likes: 2281,
        id: "234636796288450560",
    },
    {
        content: "Louis? gosh, it's been years. it's me, Neal, from Law School. anyway, i got this big juicy onion here, was thinking me and you could fuck it",
        retweets: 2376,
        likes: 6627,
        id: "204379513575055360",
    },
    {
        content: "fucking Nude Man ruine all our laser tag games, cant shoot him cause he isnt wearing the vest, cant rack up any points against him",
        retweets: 2431,
        likes: 6323,
        id: "178191539959377920",
    },
    {
        content: "YO points to spinal cord on brain diagram THATS THE BRAIN;S DICK",
        retweets: 1275,
        likes: 2551,
        id: "179736293641682944",
    },
    {
        content: "oh nothin, i was just buying some ear medication for my sick uncle... \\*LOWERS SHADES TO LOOK YOU DEAD IN THE EYE\\* who's a Model by the way,",
        retweets: 4029,
        likes: 9669,
        id: "197502223226384387",
    },
    {
        content: "\"jail isnt real,\" i assure myself as i close my eyes and ram the hallmark gift shop with my shitty bronco",
        retweets: 8074,
        likes: 21671,
        id: "181225396694560769",
    },
    {
        content: "IF THE ZOO BANS ME FOR HOLLERING AT THE ANIMALS I WILL FACE GOD AND WALK BACKWARDS INTO HELL",
        retweets: 24782,
        likes: 47662,
        id: "205052027259195393",
    },
    {
        content: "did i jsut piss myself? no . these are mood jeans that change color when i am sick of putting up with jokers such as your self",
        retweets: 3286,
        likes: 6652,
        id: "216930169028476928",
    },
    {
        content: "see this watch? i got it by Crying. my car? crying. my beautiful wife? Crying. My perfect teeth? Crying. now get the fuck out of my office",
        retweets: 9757,
        likes: 18896,
        id: "158042815128023040",
    },
    {
        content: "LISTEN UP NERD, THE WEIGHTS WITH HIEROGLYPHS ON THEM ARE IMPOSSIBLE TO LIFT UNLESS YOU POSSESS THE CORRESPONDING RUNESTONE, THIS IS HELL GYM",
        retweets: 3161,
        likes: 5911,
        id: "228881278143967232",
    },
    {
        content: "what happens when kirby swallows the qur'an and is granted its considerable power. my 81 chapter fanfic explores this issue -- and more",
        retweets: 3552,
        likes: 7552,
        id: "213844275102883840",
    },
    {
        content: "\"Is Wario A Libertarian\" - the greatest thread in the history of forums, locked by a moderator after 12,239 pages of heated debate,",
        retweets: 12497,
        likes: 23768,
        id: "107911000199671808",
    },
    {
        content: "how come a baby born with a foot in its brain is considered a \"Miracle Baby\" but when I get my dick stuck in a drawer im just some asshole",
        retweets: 1735,
        likes: 3483,
        id: "176512142944636929",
    },
    {
        content: "THE COP GROWLS \"TAKE OFF TH OSE JEANS, CITIZEN.\" I COMPLY, REVEALING THE FULL LENGTH DENIM TATTOOS ON BOTH LEGS. THE COP SCREAMS; DEFEATED",
        retweets: 5096,
        likes: 9438,
        id: "190943080730472448",
    },
    {
        content: "the doctor reveals my blood pressure is 420 over 69. i hoot & holler outta the building while a bunch of losers try to tell me that im dying",
        retweets: 12828,
        likes: 22231,
        id: "223751039709495298",
    },
    {
        content: "i have no idea how that turd got on your ceiling, but it definitely didn't fly out of my shorts while iwas doing a backflip",
        retweets: 1909,
        likes: 4943,
        id: "182955342995525632",
    },
    {
        content: "search \"crash bandicoot is real\"\n>> Did you mean \"Crash Bandicoot Israel\"?\nsearch \"no\"",
        retweets: 2866,
        likes: 6711,
        id: "323091933197115393",
    },
    {
        content: "ME: COMPUTER... SORT THE POSTS ON THIS SITE FROM LEAST TO MOST RACIST\nCOMPUTER: YES MASTER\nME: COMPUTER... PLEASE DO NOT CALL ME THAT",
        retweets: 3355,
        likes: 11322,
        id: "715139916246552576",
    },
    {
        content: "1989: the fall of the berlin wall is celebrated, historically revered\n2016: i tear down the sneeze guard at old country buffet and get Booed",
        retweets: 4948,
        likes: 12200,
        id: "734307632375336960",
    },
    {
        content: "ME: please show me the posts in the order that they were made\nCOMPUTER: thats too hard. heres some tweets i think are good. Do you like this",
        retweets: 15375,
        likes: 33686,
        id: "760997832237129729",
    },
    {
        content: "I DRIVE OFF OF A CLIFF AND SCRAMBLE TO RIP THE AXLE OFF OF MY CAR AND LIFT IT ABOVE MY HEAD AS I PLUMMET TOWARDS CERTAIN DOOM. ONE LAST REP",
        retweets: 2025,
        likes: 5266,
        id: "331216421013049344",
    },
    {
        content: "AS THE GUILLOTINE SLIDES TOWARDS MY NECK, I PRODUCE A TINY BARBELL I'VE BEEN HIDING IN MY MOUTH AND LIFT IT WITH MY TONGUE. ONE LAST REP",
        retweets: 5302,
        likes: 12685,
        id: "331220734250725376",
    },
    {
        content: "The wine imparts a foreign bitterness. How could he betray me? We were brothers. I fall to the ground. Execute a partial curl. One last rep.",
        retweets: 2135,
        likes: 5782,
        id: "331223511962107904",
    },
    {
        content: "how dare you fuck with me. how dare you fuck with me , on the year of Luigi",
        retweets: 8208,
        likes: 12561,
        id: "348547842761170944",
    },
    {
        content: "are you having a crap of me mate?? Are you, having a crap of me mate",
        retweets: 2592,
        likes: 4844,
        id: "539099548548079617",
    },
    {
        content: "FBI AGent: We have given u a new identity because of the death threats your bad posts get you. Youre Tim Crap now\nMe (as Tim Crap now): Cool",
        retweets: 2262,
        likes: 5797,
        id: "521873409316487169",
    },
    {
        content: "@marcorubio im sorry for calling you \"Unelectable\" just because you changed your name to \"The Incest President\"",
        retweets: 148,
        likes: 521,
        id: "604324414335905792",
    },
    {
        content: "another day volunteering at the betsy ross museum. everyone keeps asking me if they can fuck the flag. buddy, they wont even let me fuck it",
        retweets: 15791,
        likes: 40567,
        id: "171450835388203008",
    },
    {
        content: "its the weekend baby. youknow what that means. its time to drink precisely one beer and call 911",
        retweets: 23625,
        likes: 38807,
        id: "396296773964017665",
    },
    {
        content: "BOSS TELLS ME I CAN KISS MY FERRETS AT WORK, BUT NO OPEN MOUTH. I PUNCH THE FLOOR SO HARD HIS SCREEN SAVER DEACTIVATES",
        retweets: 8437,
        likes: 19739,
        id: "256431328592011266",
    },
    {
        content: "the jduge orders me to take off my anonymous v mask & im wearing the joker makeup underneath it. everyone in the courtroom groans at my shit",
        retweets: 11202,
        likes: 30607,
        id: "575121631846227968",
    },
    {
        content: "The reason the \"Cars\" movies have gained so much popularity is becuase the cars speak to one another. You don't get that with real life cars",
        retweets: 6228,
        likes: 12750,
        id: "383740993637343232",
    },
    {
        content: "i am selling six beautfiul, extremely ill, white horses. they no longer recognize me as their father, and are the Burden of my life",
        retweets: 10180,
        likes: 24088,
        id: "504134967946141697",
    },
    {
        content: "nerd with lame attitude: North Korea is bad\nMe: Have you ever lived there.\nnerd: (his glasses fall off)\nMe: Catch you later",
        retweets: 5830,
        likes: 14680,
        id: "496077711434330113",
    },
    {
        content: "issuing correction on a previous post of mine, regarding the terror group ISIL. you do not, under any circumstances, \"gotta hand it to them\"",
        retweets: 11141,
        likes: 38389,
        id: "831805955402776576",
    },
    {
        content: "coming up with some new racism slogans... \"Racism: Never knew it could be this good\" \"Racism: Gotta geddit\" \"Racism: Now that's what's nice\"",
        retweets: 455,
        likes: 1641,
        id: "653978129749426176",
    },
    {
        content: "obama and his crack team of nsa crooks watching me shit: \"sir, he's scooting backwards so his dick doesn't touch the rim\" \"Thuis guy's good\"",
        retweets: 1988,
        likes: 5419,
        id: "344941923351527424",
    },
    {
        content: "koko the talking ape.. has been living high on the hog, wasting our tax dollars on high capacity diapers. No more. i will suplex that beast,",
        retweets: 2955,
        likes: 8145,
        id: "508470830981218304",
    },
    {
        content: "i fear my tropical fish no longer respect me after i accidetnally stumbled backwards & smushed my ass hole right up against their $3000 tank",
        retweets: 3989,
        likes: 15372,
        id: "843885268805599232",
    },
    {
        content: "drunk driving may kill a lot of people, but it also helps a lot of people get to work on time, so, it;s impossible to say if its bad or not,",
        retweets: 8620,
        likes: 25669,
        id: "464802196060917762",
    },
    {
        content: "ME: there is a new type of beer called \"Wine\"\nshirtless guy witht 104 followers: Shut the fuck up\nME: Yes sir",
        retweets: 6216,
        likes: 20928,
        id: "779812111249772544",
    },
    {
        content: "ME: why am i just the man for the job? lets see. i love hamburgers, i love to help,\nHAMBURGER HELPER CEO: Leave these hallowed halls at once",
        retweets: 2344,
        likes: 4673,
        id: "598672627515916288",
    },
    {
        content: "sort of bullshit that im not allowed to be the wendy's mascot just because im repugnant to most people & woudl negatively impact their sales",
        retweets: 213,
        likes: 487,
        id: "346647087527624704",
    },
    {
        content: "sorry. my \"wrestle a pile of huge dildos for charity\" event was a total imbroglio. all proceeds raised must now go towards my hospital bill",
        retweets: 208,
        likes: 504,
        id: "305345947121094656",
    },
    {
        content: "The SHeriff's Department Denies Your Request To Be Sat On By Muscle Ladies As Punishment And Would Like For You To Pay Your Ticket With Cash",
        retweets: 451,
        likes: 1216,
        id: "326384487120375808",
    },
    {
        content: "scenario: i'm sitting in the dentist's chair getting my cavities filled. a stray pube enters the window and lands in my mouth. who's liable",
        retweets: 231,
        likes: 552,
        id: "256795162993377280",
    },
    {
        content: "\"ey!! im walkin here\" - me getting waterboarded by the us government",
        retweets: 450,
        likes: 1014,
        id: "330795580735500290",
    },
    {
        content: "well, at leas i have my dignity.  \\*trrips over shoelace, somersaults itno 3500mph faceplant, pants and dirty diaper fly off ass across room\\*",
        retweets: 146,
        likes: 285,
        id: "12295173117",
    },
    {
        content: "dear god. in all my years.... an ancient diaper perfectly preserved in amber-- no wait, its just some shitty caveman head. throw it back",
        retweets: 111,
        likes: 230,
        id: "178870574335004672",
    },
    {
        content: "thank you for emailing me the picture of the pillsbury doughboys dick while my dad and all my uncles were standing right behind me. Not",
        retweets: 299,
        likes: 942,
        id: "367337623573901313",
    },
    {
        content: "i just sucked my own dick and got poisoned. no podcast tonight",
        retweets: 5342,
        likes: 13808,
        id: "369997365983195136",
    },
    {
        content: "putting the vacuum on my dick until I stop hearing crumbs go down the tube",
        retweets: 1399,
        likes: 4742,
        id: "717156281669271552",
    },
    {
        content: "i often disagree with DigimonOtis, but his efforts to keep Sharia Law out of the donkey kong 64 wiki are much needed in this wolrd of danger",
        retweets: 3650,
        likes: 14496,
        id: "892825482814771203",
    },
    {
        content: "no you see, if you look closely at this drawing he put a face on the sun. clearly this child is autistic",
        retweets: 24,
        likes: 41,
        id: "134268900559949824",
    },
    {
        content: "\"Soda is back\" Only at Mcdonald",
        retweets: 927,
        likes: 2323,
        id: "586176331085438976",
    },
    {
        content: "by calling them \"Stackers\" instead of quesadillas, taco bell is legally allowed to fill them with 49% bird shit",
        retweets: 2063,
        likes: 16404,
        id: "993006582874169345",
    },
    {
        content: "1936: alan turing invents the computer and is persecuted for being gay. 2006: s. miyamoto invents the Wii and is persecuted for being Casual",
        retweets: 451,
        likes: 1003,
        id: "233188063914889216",
    },
    {
        content: "look, im not saying that martin luther king jr was a gamer. that would be ludicrous. im simply saying that if games had existed at the time,",
        retweets: 8879,
        likes: 28542,
        id: "830105130104127490",
    },
    {
        content: "congress members fighting over who can scream \"halo 5\" the loudest, until a senior member stands up and yells \"halo 6\", infuriating them all",
        retweets: 2105,
        likes: 4075,
        id: "15269318182",
    },
    {
        content: "ARMY: your nickname reflects poorly on us all. we're changing it to something like \"raven\" or \"switchknife\"\nME: no. \"hostage killer\" is good",
        retweets: 2920,
        likes: 7324,
        id: "593017471172382720",
    },
    {
        content: "pass the savings onto me mother fucker",
        retweets: 432,
        likes: 1058,
        id: "564527230068334593",
    },
    {
        content: "i siad jobs plan, not inside jobs plan!! #oboama911",
        retweets: 32,
        likes: 100,
        id: "112909631675834368",
    },
    {
        content: "hm lets see.. \\*Logs On To Dark Net\\* bomb recipes... voyeur upskirt.. snuff vids..DILBERT?? WHo thef fuck put dilbert on dark net",
        retweets: 1962,
        likes: 5695,
        id: "35713808747986944",
    },
    {
        content: "me and a bunch of stupid assholes are going to start a community in the middle of the desert to either die or prove a very important point",
        retweets: 3244,
        likes: 13190,
        id: "435373709344251904",
    },
    {
        content: "$1000000 Post: julian assange walking out of the ecuadoran embassy covered in shit and saying do not go in there like ace ventuera",
        retweets: 1839,
        likes: 14289,
        id: "1025035968904974337",
    },
    {
        content: "ah, So u persecute Jared Fogle just because he has different beliefs? Do Tell. (girls get mad at me) Sorry. Im sorry. Im trying to remove it",
        retweets: 3841,
        likes: 12525,
        id: "660644922744262656",
    },
    {
        content: "people come up to me and say, \"I will never use the bathroom. I will never shit\" and i gotta tell them pal, sooner or later youre gonna shit",
        retweets: 4230,
        likes: 14773,
        id: "828031141546430465",
    },
    {
        content: "(speaking into phone) get me on the computer",
        retweets: 2985,
        likes: 15096,
        id: "925509673272344576",
    },
    {
        content: "caught my son running a google search for \" shit stain pussy \". i am beyond distraught. we are strictly a Bing family",
        retweets: 3176,
        likes: 8119,
        id: "343519917217296385",
    },
    {
        content: "im the guy in the incognito browser icon who jacks off wearing a trenchcoat and sunglasses",
        retweets: 811,
        likes: 2727,
        id: "553306506377330689",
    },
    {
        content: "icant come to work today.. on account of JERRY DUTY \\*SHoves every seinfeld disk into dvd player at once\\*",
        retweets: 2223,
        likes: 3741,
        id: "10849247486287872",
    },
    {
        content: "(passes a man in a hardhat toiling over a roadside utility cabinet in 100 degree weather in my black convertible) Nice Fedora Dip Shit",
        retweets: 781,
        likes: 2340,
        id: "618836402759794688",
    },
    {
        content: "to whoever changed my background pic to spider man with his dick out, thank you. im keeping it just to make you mad",
        retweets: 181,
        likes: 709,
        id: "440105585464201216",
    },
    {
        content: "telling secretary to hold my calls so i can spend some time lookinh at girls' avatars with a loupe",
        retweets: 121,
        likes: 526,
        id: "601496979294855168",
    },
    {
        content: "oh, youvve read a few academic papers on the matter? cute. i have read over 100000 posts.",
        retweets: 7780,
        likes: 17444,
        id: "650184561045995520",
    },
    {
        content: "waiting the customary 20 minutes after someone in the group dm says one of their pets died before posting a picture of sponge bob Nutting",
        retweets: 5706,
        likes: 33943,
        id: "960062849279234050",
    },
    {
        content: "(in worst human voice possible) folks rmember to click that fuckin like & subscribe button and leave a comment below in the fuckin box there",
        retweets: 4505,
        likes: 11126,
        id: "677094845572358144",
    },
    {
        content: "the wise man bowed his head solemnly and spoke: \"theres actually zero difference between good & bad things. you imbecile. you fucking moron\"",
        retweets: 20200,
        likes: 58028,
        id: "473265809079693312",
    },
    {
        content: "startling how im the only person on this site with an actual human soul. you would think the other guys on here have one, but no",
        retweets: 1924,
        likes: 3670,
        id: "641861221042548736",
    },
    {
        content: "pal the only \"meltdown\" im having is my ice cream melting down into my hand while I lay on the beach & laugh while thinking about the trolls",
        retweets: 2815,
        likes: 6761,
        id: "685870817528442881",
    },
    {
        content: "\"Why should there be only one good friday. Let's try our best to make all the Fridays good. Thank you\" -a quote i invented which made me cry",
        retweets: 3417,
        likes: 6640,
        id: "584052680521293824",
    },
    {
        content: "(intentionally spoken within earshot of severral arbys girls) ah fuck. my hands smell like steroids from using steroids all day",
        retweets: 834,
        likes: 2790,
        id: "649859569590628352",
    },
    {
        content: "everyone less mentally ill than me is Privileged, everyone more mentally ill than me is Toxic, everyone equally mentally ill to me is Cool",
        retweets: 16553,
        likes: 86846,
        id: "1333817949623263232",
    },
    {
        content: "many people are finding out that despite millions of years of evolution the human body was not designed to get run over by cars",
        retweets: 2447,
        likes: 24803,
        id: "1332007695398830081",
    },
    {
        content: "urine is not sterile. it has piss in it",
        retweets: 5797,
        likes: 48617,
        id: "1309532915110260737",
    },
    {
        content: "if i dont get into Heaven ill just use the rainbow bridge that dogs use. and ill push as many animals off the bridge as i can in the process",
        retweets: 3261,
        likes: 28767,
        id: "1432871650106609670",
    },
    {
        content: "which one of you mother fuckers said im going to go volunteer at the dog shelter, as a Dog. disgusting comment",
        retweets: 2083,
        likes: 23275,
        id: "1417713452932423681",
    },
    {
        content: "Dear drigl,\n An item you listed in the Community Market has been sold to Osama Bin Laden.  Your Steam Wallet has been credited 0.27 USD.",
        retweets: 1632,
        likes: 4035,
        id: "365649698205347842",
    },
    {
        content: "in solidarity with all of this crap going on, ive Poisoned my ass hole",
        retweets: 2108,
        likes: 22900,
        id: "1267548496841736192",
    },
    {
        content: "looking at the data and simply laughing",
        retweets: 7904,
        likes: 55731,
        id: "1371573019701735430",
    },
    {
        content: "big gov shut down tomorrow \"U Know What That Means\"\n\nJacking off: LEGAL\n\nget your jacking off paraphernalia ready its gonna be a Barn burner",
        retweets: 2293,
        likes: 19263,
        id: "1343267657378721792",
    },
    {
        content: "please stop saying barnum & bailey is suing me for \"stealing their clown routine\". they are suing me for very serious and legitimate reasons",
        retweets: 333,
        likes: 1132,
        id: "481774929286004736",
    },
    {
        content: "elon if youre reading this please get back to me about my idea for inventing a $900 hot dog that tastes like shit. thank you",
        retweets: 2187,
        likes: 27368,
        id: "1333572722098536448",
    },
    {
        content: "yes there is a hemorrhoid sub reddit and yes it is full of guys somehow obtaining 4k resolution pics of their ass holes and posting them",
        retweets: 954,
        likes: 17734,
        id: "1322254548438712320",
    },
    {
        content: "massive back tattoo that says \"Sucked Off 8-12-2006\"",
        retweets: 1661,
        likes: 21562,
        id: "1317253224483598337",
    },
    {
        content: "hate it when i slip up while changing a roll of toilet paper and the spring loaded holder fires the cardboard tube straight up my ass hole",
        retweets: 1940,
        likes: 21211,
        id: "1308654351401984000",
    },
    {
        content: "wife is sad because we had to remove all doorknobs from our dreamhome since they were at the exact perfect hieght to go up my ass by mistake",
        retweets: 6401,
        likes: 67610,
        id: "1301282161094356994",
    },
    {
        content: "ok mr honda dealer lets get down to brassed tacks. U dont wanna waste my time, i dont wanna waste yours. now; CAN i jack off in your toilet,",
        retweets: 1729,
        likes: 19227,
        id: "1293090459586158592",
    },
    {
        content: "just got my new jeans in the mail and the trolls are sweatting like a bird at the kfc factory",
        retweets: 987,
        likes: 12451,
        id: "1287065233345794048",
    },
    {
        content: "alright. wherever the dart hits on this map is wwhere im building my new Mosque. (dart hits wtc ground zero) Yikes! Uh oh",
        retweets: 1135,
        likes: 15332,
        id: "1280922623027720192",
    },
    {
        content: "wife is no longer permitting me to jack off in the car during her book club meetings. where am i supposed to jack off then? fucking EGYPT???",
        retweets: 6815,
        likes: 66635,
        id: "1216390911526965248",
    },
    {
        content: "cant wait for this Cunt to take us to mars; no Sjw, no Girls, just us boys sitting around in 55.9m sq miles of waste land, swapping MEMES !!",
        retweets: 6482,
        likes: 59243,
        id: "1279812599664619521",
    },
    {
        content: "scribbling my exposed dick out of this photo with a blue bic pen so its good enough for linked in",
        retweets: 1193,
        likes: 6023,
        id: "816669429006073856",
    },
    {
        content: "while my trolls are busy \"moving the goal posts\" im afraid i am simply moving the \"good posts\"",
        retweets: 2371,
        likes: 19271,
        id: "1229047367707443202",
    },
    {
        content: "i put years of hard work into getting my torture degree at torture college & now everyones like \"oh tortures bad\",\"its ineffective\" fuck off",
        retweets: 4971,
        likes: 13517,
        id: "544197494755037185",
    },
    {
        content: "the only time isaid the \"N word\" i said it with perfect frequency/timing to intercept & cancel out the sound waves of another guy saying it,",
        retweets: 5022,
        likes: 53111,
        id: "1380222303594639361",
    },
    {
        content: "the last chilean miner emerges with two armfuls of coal, making all 32 of his colleagues look like Ass Holes",
        retweets: 2290,
        likes: 7598,
        id: "27274712927",
    },
    {
        content: "im the guy at mcdonalds who decides which states the offers are not valid in, an d i get more death threats than god",
        retweets: 5992,
        likes: 19629,
        id: "846489221942722560",
    },
    {
        content: "now more than ever, people are threatening to piss",
        retweets: 3373,
        likes: 24208,
        id: "1174563778005889024",
    },
    {
        content: "ive done the research, ive looked at the facts, ive analyzed the hard data and my conclusion is that youre way more mad than i am right now,",
        retweets: 7673,
        likes: 36735,
        id: "1138611519363506176",
    },
    {
        content: "summoner draws a venn diagram on the floor with circles labeled \"rude\" & \"illegal\". my fat face emerges from the center and begs for treats",
        retweets: 3881,
        likes: 8324,
        id: "331764878664671234",
    },
    {
        content: "its fucked up how there are like 1000 christmas songs but only 1 song aboutr the boys being back in town",
        retweets: 62189,
        likes: 109152,
        id: "670963270317154304",
    },
    {
        content: "[man leans into doorway of WTC bathroom]\n\"Hey, you gotta finish up in there.  9/11 is happening.\"\n\"Alright. Just a sec.\"",
        retweets: 5853,
        likes: 17463,
        id: "457675646970634240",
    },
    {
        content: "its true. each cow's udder has one teat that will shoot piss instead of milk and ruin the whole batch. they call it the Farmer's Gamble",
        retweets: 2074,
        likes: 5433,
        id: "402793480986324992",
    },
    {
        content: "yeah like im just going to put bottles of my own damn urine up on the mantel. you fucking idiot. this is celeb urine",
        retweets: 712,
        likes: 2745,
        id: "663286798316126208",
    },
    {
        content: "( me after seeing two guys in any context whatsoever) Well well well if it isnt the Blowjob Brothers",
        retweets: 7776,
        likes: 68153,
        id: "1464841223215083523",
    },
    {
        content: "Im fucking the wall. a tectonic shift 900 miles away causes it to slice off my thin prick and drop it on mexican soil. Its their problem now",
        retweets: 2199,
        likes: 19093,
        id: "1085660285359218695",
    },
    {
        content: "my big sons have made a mess of the garage again after being riled up by  the good word of the Lord",
        retweets: 2829,
        likes: 7560,
        id: "537598363534123008",
    },
    {
        content: "CONGRATULATIONS\nLegendary Babe Ruth\n\"Posthumous conversion to Islam\"\nNow thats a home run",
        retweets: 2532,
        likes: 26920,
        id: "1402101044725706754",
    },
    {
        content: "my tweets bring people together, and unite this country even more than 9/11 did. every time i post its like 9/11 happening again",
        retweets: 7166,
        likes: 49080,
        id: "1158835118049415168",
    },
    {
        content: "hopping on some tech support forums to accuse people with minor hardware issues of being Mad",
        retweets: 786,
        likes: 3016,
        id: "751281763876352000",
    },
    NO,
    NEVER,
].concat(NASA)

function tweetPoolContentFromDril(dril: CursedDrilContent): TweetPoolContent {
    return {
        content: dril.content,
        retweets: dril.retweets,
        likes: dril.likes,
        url: `https://twitter.com/dril/status/${dril.id}`,
        author: "wint (@dril)",
        avatar: DRIL_ICON,
    }
}

const NASA_URLS = new Set(NASA.map(t => tweetPoolContentFromDril(t).url))

const TOOTS_BY_URL = new Map(CONTENT.map(obj => {
    const content = tweetPoolContentFromDril(obj)
    return [content.url, content]
}))

interface PersistedJSON {
    v: number
    toots: string[]
}

export class Dril extends TweetPool {
    public getNo(): TweetPoolContent {
        return tweetPoolContentFromDril(NO)
    }

    public logoff(): TweetPoolContent {
        return tweetPoolContentFromDril(NEVER)
    }

    public getGeans(): string {
        return GEANS
    }

    public getBeerVirus(): TweetPoolContent {
        return tweetPoolContentFromDril(BEERVIRUS)
    }

    public async getNASA(): Promise<TweetPoolContent> {
        const idx = await randomNumber(0, NASA.length - 1)
        return tweetPoolContentFromDril(NASA[idx])
    }

    public isNASA(url: string): boolean {
        return NASA_URLS.has(url)
    }

    protected brainKeyForChannel(chanId: string): string {
        return `${BRAIN_KEYS.TOOT_LIST}:${chanId}`
    }

    protected get list(): Map<string, TweetPoolContent> {
        return TOOTS_BY_URL
    }

    protected get persistenceVersion(): number {
        return 2
    }
}
