# AetheBot for Discord

## Setup

Create a Discord Bot account 
[here](https://discordapp.com/developers/applications/me).

Copy the token it generated.

Create a `development.env` file in the root of this repo.

Inside this file, paste the token like this:

```
DISCORD_TOKEN=[token]
```

## Debugging in Visual Studio Code

### With Node Installed

If you've got Node installed on your system, either via `nvm`, `nodenv`, or
compiling it manually, you should just be able to run the debugger by pressing
F5 in Visual Studio Code. Make sure you've run `yarn install` first! Also, make
sure the configuration in the debugger tab (drop down, top left) is set to 
"Launch Using System Node".

This will run the bot in a not-very Production-like way, however, since it will
run both the Website and Bot in the same process, that communicate with each
other in-memory, but this mode is simpler to debug and setup.

### Running Node Inside Docker

Change to the debugger tab and change the configuration (drop down, top left)
from "Launch Using System Node" to "Launch in Docker (Debug Bot)". The first time 
you run this you will need to pull down all the `node_modules` compiled against 
the Linux that runs in Docker:

```
rm -rf node_modules
docker-compose -f docker-compose.yml -f docker-compose.dev.yml run bot yarn install
```

Now you can go back into Visual Studio Code and press F5 to start. Note that
when running in Docker, it simulates a Production-like environment, where the
Bot process and the Website process are completely separate node processes,
which communicate with each other via a Redis PubSub channel. By default,
Visual Studio Code will attach its debugger to the Bot process, you can change
this by using the "Launch in Docker (Web)" configuration instead.

The node processes running in Docker will automatically restart when the code
is recompiled. You can automate this to happen whenever you modify a TypeScript
file by running `yarn tsc -w` on your host.

The website will run under http://localhost:8080

## Environment Variables


| Variable             | Required? | Purpose | Example |
| -------------------- | --------- | ------- | ------- |
| `DISCORD_TOKEN`      | Yes       | The generated Discord Bot account token for authentication with Discord. | `aaabbbccc111222333`|
| `WEBSITE_BASE_URL`   | No        | The base URL for the bot's internal website. Leave undefined to not run the website.| `https://my-great-aethebot-instance.herokuapp.com`
| `DEFAULT_ADMIN_USER` | No        | Discord User ID for the default admin user. | `12345678901234567` |
| `REDIS_URL`          | No        | URL to your Redis instance, to use as the bot's persistent storage. | `redis://user:password@my-redis.host:13337`|

## Creating a Voice Noise

The voice noises themselves are in an object in 
`src/features/voicenoise/noises.ts`. Provide the file name for the noise to
play, and a regular expression to match on. It will play the noise in the
channel you are currently in if the regex matches and you've mentioned the bot.
Please keep try to keep the volume of your noise consistent with the other
noises.

Noises can be provided in any FFmpeg supported format (such as mp3), or as a raw
Opus stream. Raw Opus streams are preferred, since they don't require
transcoding on the server and will therefore load much faster. You can create
a stream yourself using FFmpeg like this:

```
ffmpeg -i [input].mp3 -vn -map 0:a -acodec libopus -f data -sample_fmt s16 -vbr off -ar 48000 -ac 2 -ab 64k [output].dat
```

You *must* name the resulting file with the `.dat` extension as a clue for
AetheBot that this file is a raw Opus stream, otherwise it will pass it on to
FFmpeg for transcoding.

Note that we will be switching to proper `.opus` (really OGG) files once the
Discord.js Prism Media changes land.
