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

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    await syncGuildsWithBackend(readyClient);
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

client.login(process.env.DISCORD_TOKEN);

