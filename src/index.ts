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

client.login(process.env.DISCORD_TOKEN);