# AetheBot for Discord

## Setup

### Using Node.js

The current required version of Node.js is specified in `.node-version`.

This project uses modern Yarn, which first requires corepack:

```sh
corepack enable
```

Now you can run `yarn install` as normal to setup your dependencies.

Create a Discord Bot account 
[here](https://discordapp.com/developers/applications/me).

Copy the token it generated.

Create a `development.env` file in the root of this repo.

Inside this file, paste the token like this:

```
DISCORD_TOKEN=[token]
DEFAULT_ADMIN_USER=[your discord user ID]
```

To run, recommend using Visual Studio Code, since it'll use the `development.env` file.
See section below.

### Using Bun

Install [Bun](https://bun.sh) 0.7.0 or newer.

Create a Discord Bot account 
[here](https://discordapp.com/developers/applications/me).

Copy the token it generated.

Create a `.env.local` file in the root of this repo.

Inside this file, paste the token like this:

```
DISCORD_TOKEN=[token]
DEFAULT_ADMIN_USER=[your discord user ID]
```

Run with Bun:

```
bun run src/index.ts --brainPath ./brain.json
```

Not working (as of 1.0.20):

- Voice Noise (missing `node:dgram` `createSocket` support): [oven-sh/bun#1630](https://github.com/oven-sh/bun/issues/1630)

### Initial Setup

Make sure you have `DEFAULT_ADMIN_USER` set to your Discord user ID, you can find it
by enabling Developer Mode in Discord, then right clicking yourself in the user list,
and clicking Copy User ID.

Start the bot using the instructions above. When you do, it will print out a URL into
standard output that you can use to join the bot to a server. You must have permission
on the server to do this. Finally, once you've joined the bot to a server, send it a 
direct message containing exactly: `admin deploy commands` to deploy the slash
commands. You will need to re-run this any time you change the slash commands.

### Can You Join My Server?

AetheBot is not a hosted service. However, it is open source, and you are free to
use it in any way as specified in the license, including hosting your own copy of
the bot. I recommend forking the repo, and editing `src/index.ts` to change the
features that get loaded into the bot to better suit your specific needs.

## Debugging in Visual Studio Code

Currently only works with Node.js. Always make sure your TypeScript version is
set to "Use Workspace Version", because Yarn requires a patched TypeScript.

### With Node Installed

If you've got Node installed on your system, either via `nvm`, `nodenv`, or
compiling it manually, you should just be able to run the debugger by pressing
F5 in Visual Studio Code. Make sure you've run `yarn install` first! Also, make
sure the configuration in the debugger tab (drop down, top left) is set to 
"Launch Using System Node".

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
when running in Docker, it runs the Bot process and the Website process as
completely separate node processes, which communicate with each other via a 
Redis PubSub channel. By default, Visual Studio Code will attach its debugger 
to the Bot process, you can change this by using the "Launch in Docker (Web)" 
configuration instead.

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

Noises can be provided in `.opus` format, 64kbps mono. Please listen to some of
the existing voice noises and adjust the volume accordingly.
