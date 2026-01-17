import { Client, Events, GatewayIntentBits } from "discord.js"
import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import 'dotenv/config'

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const guild = await client.guilds.fetch('1461935887762980938')
    const channel = await guild.channels.fetch('1461935888715092024')

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: true
    })
});

client.login(process.env.DISCORD_BOT_TOKEN);