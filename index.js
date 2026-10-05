const {Client, Collection, Events, GatewayIntentBits, MessageFlags} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`);
});


// command system to ease making multiple commands ig. just practice
client.commands = new Collection();
const cmdDirs = fs.readdirSync(path.join(__dirname, "commands"));

for(const dir of cmdDirs) {
    const cmdsPath = path.join(path.join(__dirname, "commands"), dir);
    const cmdFiles = fs.readdirSync(cmdsPath).filter((f) => f.endsWith(".js"));
    for(const f of cmdFiles) {
        const fPath = path.join(cmdsPath, f);
        const command = require(fPath);

        if('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }else {
            console.log(`[OSU bot | WARN] command in ${fPath} is missing "data" or "execute"`)
        }
    }
}

// executing the commands themselves
client.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

    if(!command) {
        console.error(`[OSU bot | ERR] no command ${interaction.commandName} found :/`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch(err) {
        console.error(err);
        if(interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "error executing this command",
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: "error executing this command",
                flags: MessageFlags.Ephemeral
            });
        }
    }
});



client.login(process.env.BOT_TOKEN);