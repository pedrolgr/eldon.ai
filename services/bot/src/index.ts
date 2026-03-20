import dotenv from 'dotenv';
import { Client, Events, GatewayIntentBits } from "discord.js"
import { joinVoiceChannel, VoiceConnection, entersState, VoiceConnectionStatus } from "@discordjs/voice";
import { recordVoiceHandler } from "./utils/voiceHandler.js";

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const guild = await client.guilds.fetch('1461935887762980938')
    const channel = await guild.channels.fetch('1461935888715092024');

    if (channel === null) {
        return console.error('Guild is null')
    }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true
    })

    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    recordVoiceHandler(connection);

});

client.on(Events.GuildCreate, async (guild) => {
    const endpoint = process.env.GUILD_JOIN_POST_URL;

    if (!endpoint) {
        console.warn("GUILD_JOIN_POST_URL is not set; skipping guild join post."); // ainda preciso criar no backend, deixando aqui pois vou criar logo logo
        return;
    }

    const payload = {
        event: "BOT_ADDED_TO_GUILD",
        guildId: guild.id,
        guildName: guild.name,
        addedAt: new Date().toISOString(),
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(`Failed to post guild join event (${response.status})`);
        }
    } catch (err) {
        console.error("Error posting guild join event:", err);
    }
});

client.login(process.env.DISCORD_TOKEN);
