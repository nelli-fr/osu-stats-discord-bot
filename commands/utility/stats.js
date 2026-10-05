const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");

let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
    if(cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

    const res = await fetch("https://osu.ppy.sh/oauth/token", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "client_credentials",
            scope: "public",
        }),
    });

    if(!res.ok) throw new Error(`[OSU bot | ERR] token request failed: ${res.status}`);

    const data = await res.json();
    cachedToken = data.access_token;
    // -60 seconds so i dont accidentally try to use it the moment it expires
    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return cachedToken;
}

function formatRank(n) {
    return n ? `#${n.toLocaleString("en-US")}` : "N/A";
} 

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("get osu! player stats by their name or id")
        .addStringOption(option => option.setName("player").setDescription("osu! username or id").setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const player = interaction.options.getString("player").trim();
        // regex is stupid (ily)
        const lookup = /^\d+$/.test(player) ? player : `@${encodeURIComponent(player)}`;

        try {
            const token = await getToken();
            const res = await fetch(`https://osu.ppy.sh/api/v2/users/${lookup}/osu`, {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (res.status === 404) {
                return interaction.editReply("player not found.");
            }
            if (!res.ok) {
                throw new Error(`osu! API returned ${res.status}`);
            }

            const user = await res.json();
            const stats = user.statistics;
            const joined = Math.floor(new Date(user.join_date).getTime() / 1000);

            const embed = new EmbedBuilder()
                .setTitle("osu! stats")
                .setURL(`https://osu.ppy.sh/users/${user.id}`)
                .setThumbnail(user.avatar_url)
                .setDescription(
                    `**Name:** ${user.username}\n` +
                    `**Joined:** <t:${joined}:D>\n` +
                    `**Country:** :flag_${user.country_code.toLowerCase()}:`
                )
                .addFields(
                    {name: "Global rank", value: formatRank(stats.global_rank), inline: true },
                    {name: "Country rank", value: formatRank(stats.country_rank), inline: true },
                    {name: "PP", value: `${Math.round(stats.pp).toLocaleString("en-US")}pp`, inline: true },
                    {name: "Accuracy", value: `${stats.accuracy.toFixed(2)*100}%`, inline: true }
                )
                .setColor(11286893)
                .setFooter({ text: "OSU Stats by Nelli" })
                .setTimestamp();

            await interaction.editReply({embeds: [embed]});
        } catch (err) {
            console.error(err);
            await interaction.editReply("something went wrong talking to the osu! api :/");
        }
    },
};