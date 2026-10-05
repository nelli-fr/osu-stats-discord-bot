## osu! stats discord bot
A very simple bot I made to practice js :P \
Adds a command `/stats <player>`, where `<player>` is either osu! account's id (eg. `40190381`) orit's username (eg. `peppy`).

### How to use
 - create a `.env` file in project's root
 - register an [oAuth application](https://osu.ppy.sh/home/account/edit#new-oauth-application) in osu! account settings page
 - copy client id and secret to `.env` as `CLIENT_ID` and `CLIENT_SECRET` respectively
 - register a discord bot in [discord dev portal](https://discord.com/developers/applications), copy it's token to `.env` as `BOT_TOKEN`. The bot needs `bot` and `applications.commands` scopes enabled
 - run `node --env-file=.env deploy-cmd.js` to register the bot's command and `node --env-file=.env index.js` to run
 - use it with `/stats <player>` (either player's name or numeric id, required)

[!wow, embed :O](images/peppy.png)

Refer to [osu! api ToS](https://osu.ppy.sh/docs/index.html#terms-of-use) before using this code, cheers :D