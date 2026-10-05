const {REST, Routes} = require("discord.js");
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const cmdDirs = fs.readdirSync(path.join(__dirname, "commands"));

for(const dir of cmdDirs) {
    const cmdsPath = path.join(path.join(__dirname, "commands"), dir);
    const cmdFiles = fs.readdirSync(cmdsPath).filter((f) => f.endsWith(".js"));
    for(const f of cmdFiles) {
        const fPath = path.join(cmdsPath, f);
        const command = require(fPath);

        if('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }else {
            console.log(`[OSU bot | WARN] command in ${fPath} is missing "data" or "execute"`)
        }
    }
}

//deploying commands
const rest = new REST().setToken(process.env.BOT_TOKEN);

(async() => {
    try {
        console.log(`[OSU bot | INFO] refreshing ${commands.length} commands...`)
        const data = await rest.put(Routes.applicationCommands(process.env.BOT_ID), {body: commands});

        console.log(`[OSU bot | INFO] reloaded ${data.length} commands`);
    } catch(err) {
        console.error(err);
    }
})();