# Discord Player Count Bot

[![Docker Pulls](https://img.shields.io/docker/pulls/droidwiki/discord-player-count?style=flat-square)](https://hub.docker.com/r/droidwiki/discord-player-count)
[![Discord](https://img.shields.io/discord/729467994832371813?color=7289da&label=Discord&logo=discord&logoColor=ffffff&style=flat-square)](https://go2tech.de/discord)

<p align="center">
    <img src="https://github.com/FlorianSW/discord-player-count-bot/raw/main/assets/example.png" alt="Example of the bot">
</p>

This is a bot implementation for the Discord API to publish the player count of a game server as the current Activity of
the bot user.

## Installation and usage

There are basically two ways to run and configure this discord bot:

* as a docker container
* as a plain nodejs app

### Start the bot

#### Run as a docker conatiner

The easiest method to install and use this bot is by running it in a docker container. I suggest to use docker-compose
for that, however, starting the container with `docker run` should be fine as well.

```yaml
version: "3"

services:
  serviceName:
    image: droidwiki/discord-player-count
    restart: unless-stopped
    volumes:
      - ./config:/app/config
    environment:
      DISCORD_TOKEN: YOUR_DISCORD_BOT_TOKEN
      # You need more configuration here, look at the Configuration section
```

You can run as many containers as you want, one container per game server you want to track.

#### Run on Heroku

The bot natively supports to be deployed on Heroku.
However, because of how Heroku works, you need to do some manual steps for your first-time setup as well.
Follow this guide to deploy the bot on Heroku.
The guide assumes you've installed the heroku cli, as well as git already.
Follow [the Heroku guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up) to setup your local environment if you did not do that already.

1. Clone this repository: `git clone https://github.com/FlorianSW/discord-player-count-bot.git`
2. Create a heroku app: `heroku create`
3. Add a `.env` configuration file (e.g. by copying the `.env.example` file) and configure as needed (see below)
4. Add the `.env` to the git repository: `git add -f .env` (you need to use the `-f` parameter as the config file is ignored)
5. Commit the configuration changes: `git commit -m 'Add bot configuration'`
6. Push the app to heroku: `git push heroku main`
7. Go to the Heroku dashboard and open the newly created app
8. Navigate to the `Resources` tab
9. Disable the `web` dyno and enable the `worker` dyno

#### Run as a plain nodejs app

You can also clone this repository, build the project on your own and start the resulting JavaScript code directly. You
need to have `nodejs` as well as `npm` installed.

* Clone the repository: `git clone https://github.com/FlorianSW/discord-player-count-bot.git`
* Change to the cloned repository: `cd discord-player-count-bot`
* Build the project: `npm ci`
* Start the bot: `npm start`
* Configure the bot with the necessary configuration

### Configure the bot

The bot needs some configuration and supports different sources for the player count, depending on the game server you
want to track. Configuration options are environment variables, which you need to export in the environment where your
app is running. Alternatively, if you run the app as a plain nodejs app, you can also create a `.env` file in the root
directory of the project and set the options there (see the `.env.example` file for an example). You need to set the
following configuration options independently of the selected game status provider.

| Configuration option          | Description | Value  |
| ----------------------------- |-------------| ------:|
| `DISCORD_TOKEN`               | The bot token of your discord app, obtained from https://discord.com/developers/applications -> (Select your application) -> Bot -> Token | `string` |
| `PLAYER_COUNT_PROVIDER`       | The name of the provider you want to fetch player count information from. | `string` |

### Game Status providers

The discord bot uses a game status provider to get the information of currently connected players. There are two
provider available right now: `steam`, `steam-query` and `cftools_cloud` (DayZ only).

#### Steam

The `steam` provider uses the Steam web api to fetch the player count of the game server. It depends on the game you
want to track if that information is available to steam, but most multiplayer games should provide this information.

You need a Steam Web API token in order to use this provider. You can create an API key on this web
page: https://steamcommunity.com/dev/apikey
When using this provider, the requests made by the Discord bot are counted against the rate limit of this key and you
need to agree to the terms of service of Steam. The provider currently polls for changes, once every 10 seconds.

To configure this provider, set the `PLAYER_COUNT_PROVIDER` configuration option to `steam`, additionally configure the
provider with the following options:

| Configuration option          | Description | Value  |
| ----------------------------- |-------------| ------:|
| `STEAM_API_TOKEN`             | Your Steam Web API token to authenticate requests.                                                             | `string` (API token) |
| `GAME_ADDRESS`                | The Game address of your game server (usually the IP address of the server together with the steam query port. | `IPv4:Port`          |

#### Steam Query

The `steam-query` provider uses the Steam Query Protocol to fetch the player count from the game server directly. This supports
a wide range of different game types and only requires the game servers IP address as well as the steam query port. No
api credentials or similar things are needed.

This protocol will query the game server directly. Please make sure that the host where the bot is hosted, is able to access the
game server on the specified steam query port.

To configure this provider, set the `PLAYER_COUNT_PROVIDER` configuration option to `steam-query`, additionally configure the
provider with the following options:

| Configuration option          | Description | Value  |
| ----------------------------- |-------------| ------:|
| `GAME_TYPE`                   | One of the supported game types. See the [list of supported games](https://www.npmjs.com/package/gamedig#user-content-games-list) for the Game Type ID of your game.                                                            | `string`             |
| `GAME_IP`                     | The IP address of the game server you want to query.                            | `IPv4`          |
| `GAME_QUERY_PORT`             | The steam query port configured for the game server.                            | `number`          |

#### CFTools Cloud (DayZ only)

The `cftools_cloud` provider uses the CFTools Cloud Game-Details API to fetch information about the current status of a server.
CFTools Cloud currently supports the game DayZ only.

To configure this provider, set the `PLAYER_COUNT_PROVIDER` configuration option to `cftools_cloud`, additionally configure
the provider with the following options:

| Configuration option          | Description | Value  |
| ----------------------------- |-------------| ------:|
| `CFTOOLS_HOSTNAME`            | The IP address or hostname of your game-server.            | `string` |
| `CFTOOLS_PORT`                | The game port (usually 2302 for DayZ) of your game-server. | `IPv4:Port`          |

The used CFTools Cloud APIs of this provider do not need any authentication, hence there is no configuration variable for that.

### Map images (Status message only)

The bot can use an image of a map in the status message posted to the channel defined in the `DISCORD_MESSAGE_CHANNEL_ID` environment variable.
In order to configure image urls, create a file named `maps.json` in the `config` directory.
The key of the object is the name as returned by the game server (this is highly individual per game).
The value is an object with the `name` and `imageUrl` key describing the map.
For example:
```json
{
  "CT": {
    "name": "Carentan",
    "imageUrl": "https://raw.githubusercontent.com/MarechJ/hll_rcon_tool/master/rcongui/public/maps/carentan.webp"
  }
}
```
Where `CT` is the map name returned by the game server.

Make sure that the value of `imageUrl` is publicly available.
