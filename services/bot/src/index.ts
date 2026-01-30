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

    const guild = await client.guilds.fetch('380574678634332171')
    const channel = await guild.channels.fetch('1244377081022906460');

    if(channel === null) {
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

client.login(process.env.DISCORD_TOKEN);