import dotenv from 'dotenv';
import { ChannelType, Client, Events, GatewayIntentBits, Guild } from "discord.js"
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

const VOICE_CHANNEL_TYPES = new Set([ChannelType.GuildVoice, ChannelType.GuildStageVoice]);

async function syncGuildsWithBackend(client: Client): Promise<void> {
    const baseUrl = process.env.GUILD_JOIN_POST_URL;

    if (!baseUrl) {
        console.warn("[Sync] GUILD_JOIN_POST_URL not set, skipping sync.");
        return;
    }

    try {

        const botGuildIds = new Set(client.guilds.cache.map((g) => g.id));

        const res = await fetch(`${baseUrl}/active`);
        if (!res.ok) {
            console.error(`[Sync] Failed to fetch active servers (${res.status})`);
            return;
        }
        const activeServerIds = (await res.json()) as string[];

        const toDeactivate = activeServerIds.filter((id) => !botGuildIds.has(id));

        if (toDeactivate.length === 0) {
            console.log("[Sync] All servers in sync, nothing to update.");
            return;
        }

        console.log(`[Sync] Deactivating ${toDeactivate.length} server(s):`, toDeactivate);

        const patchRes = await fetch(`${baseUrl}/bulk-deactivate`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ discordServerIds: toDeactivate }),
        });

        if (!patchRes.ok) {
            console.error(`[Sync] Failed to bulk deactivate (${patchRes.status})`);
        } else {
            console.log("[Sync] Sync complete.");
        }
    } catch (err) {
        console.error("[Sync] Error during guild sync:", err);
    }
}

async function syncGuildChannelsWithBackend(guild: Guild): Promise<void> {
    const baseUrl = process.env.GUILD_JOIN_POST_URL;

    if (!baseUrl) {
        console.warn("[Sync] GUILD_JOIN_POST_URL not set, skipping channel sync.");
        return;
    }

    try {
        const fetchedChannels = await guild.channels.fetch();
        const channels = fetchedChannels
            .filter((channel): channel is NonNullable<typeof channel> => Boolean(channel))
            .filter((channel) => VOICE_CHANNEL_TYPES.has(channel.type))
            .map((channel) => ({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                position: "position" in channel ? channel.position : undefined,
                parentId: "parentId" in channel ? channel.parentId : null,
            }));

        const response = await fetch(`${baseUrl}/channels/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                discordServerId: guild.id,
                name: guild.name,
                channels,
            }),
        });

        if (!response.ok) {
            console.error(`[Sync] Failed to sync channels for ${guild.name} (${response.status})`);
        }
    } catch (err) {
        console.error(`[Sync] Error syncing channels for ${guild.name}:`, err);
    }
}

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    await syncGuildsWithBackend(readyClient);

    for (const guild of readyClient.guilds.cache.values()) {
        await syncGuildChannelsWithBackend(guild);
    }
});


client.on(Events.GuildCreate, async (guild) => {
    const endpoint = process.env.GUILD_JOIN_POST_URL;

    if (!endpoint) {
        console.warn("You need to inform API URL");
        return;
    }
    console.log(guild.name)
    const payload = {
        discordServerId: guild.id,
        name: guild.name,
        botAddedAt: new Date().toISOString(),
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

        await syncGuildChannelsWithBackend(guild);
    } catch (err) {
        console.error("Error posting guild join event:", err);
    }
});

client.on(Events.GuildDelete, async (guild) => {

    if (!guild.available) {
        console.log(`[GuildDelete] Guild ${guild.id} became unavailable (outage?), ignoring.`);
        return;
    }

    const baseUrl = process.env.GUILD_JOIN_POST_URL;

    if (!baseUrl) {
        console.warn("You need to inform API URL");
        return;
    }

    const endpoint = `${baseUrl}/deactivate`;

    try {
        const response = await fetch(endpoint, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ discordServerId: guild.id }),
        });

        if (!response.ok) {
            console.error(`Failed to post guild leave event (${response.status})`);
        } else {
            console.log(`Bot removed from guild: ${guild.name} (${guild.id})`);
        }
    } catch (err) {
        console.error("Error posting guild leave event:", err);
    }
});

client.on(Events.ChannelCreate, async (channel) => {
    if (!("guild" in channel) || !channel.guild) return;
    await syncGuildChannelsWithBackend(channel.guild);
});

client.on(Events.ChannelDelete, async (channel) => {
    if (!("guild" in channel) || !channel.guild) return;
    await syncGuildChannelsWithBackend(channel.guild);
});

client.on(Events.ChannelUpdate, async (_oldChannel, newChannel) => {
    if (!("guild" in newChannel) || !newChannel.guild) return;
    await syncGuildChannelsWithBackend(newChannel.guild);
});

client.login(process.env.DISCORD_TOKEN);
