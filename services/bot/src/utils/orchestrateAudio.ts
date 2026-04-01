interface OrchestrateAudioInput {
    discordServerId: string;
    discordChannelId: string;
    discordUserId: string;
    discordUsername: string;
    audioMp3Buffer: Buffer;
}

interface OrchestrateAudioResponse {
    transcription: string;
    isInappropriate: boolean;
    reason: string | null;
    savedFlaggedMessage: boolean;
    flaggedMessageId?: string;
}

function getServerApiBaseUrl(): string | null {
    const baseUrl = process.env.GUILD_JOIN_POST_URL;

    if (!baseUrl) {
        console.warn("[Config] GUILD_JOIN_POST_URL not set.");
        return null;
    }

    return baseUrl.replace(/\/+$/, "");
}

export async function orchestrateAudio(input: OrchestrateAudioInput): Promise<OrchestrateAudioResponse | null> {
    const baseUrl = getServerApiBaseUrl();

    if (!baseUrl) {
        return null;
    }

    const formData = new FormData();
    formData.set("discordServerId", input.discordServerId);
    formData.set("discordChannelId", input.discordChannelId);
    formData.set("discordUserId", input.discordUserId);
    formData.set("discordUsername", input.discordUsername);
    formData.set(
        "audio",
        new Blob([new Uint8Array(input.audioMp3Buffer)], { type: "audio/mpeg" }),
        `recording-${input.discordUserId}-${Date.now()}.mp3`,
    );

    const response = await fetch(`${baseUrl}/audio/orchestrate`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to orchestrate audio (${response.status}): ${error}`);
    }

    return await response.json() as OrchestrateAudioResponse;
}
