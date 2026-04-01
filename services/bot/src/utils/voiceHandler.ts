import { EndBehaviorType, VoiceReceiver, VoiceConnection } from "@discordjs/voice";
import { Guild } from "discord.js";
import prism from "prism-media";
import { convertWavToMp3Buffer } from "./convertWavToMp3Buffer";
import { orchestrateAudio } from "./orchestrateAudio";

export function recordVoiceHandler(connection: VoiceConnection, guild: Guild) {
    const receiver: VoiceReceiver = connection.receiver;
    const usernameCache = new Map<string, string>();

    const resolveDiscordUsername = async (userId: string): Promise<string> => {
        const cachedUsername = usernameCache.get(userId);
        if (cachedUsername) {
            return cachedUsername;
        }

        try {
            const member = await guild.members.fetch(userId);
            const username = member.displayName || member.user.username;
            usernameCache.set(userId, username);
            return username;
        } catch {
            return userId;
        }
    };

    receiver.speaking.on("start", (userId: string) => {
        const opusStream = receiver.subscribe(userId, {
            end: {
                behavior: EndBehaviorType.AfterSilence,
                duration: 100,
            },
        });

        const decoder = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
        const pcmStream = opusStream.pipe(decoder);

        let chunks: Buffer[] = [];
        let currentChunkSize = 0;
        let totalBytes = 0;
        const BYTES_PER_SECOND = 48000 * 2 * 2; // 48kHz * 2 channels * 16-bit
        const MAX_BYTES = BYTES_PER_SECOND * 9; // 9 seconds
        const MIN_BYTES = BYTES_PER_SECOND * 0.5; // 0.5 second

        const processAudio = async (buffers: Buffer[], isFinal: boolean) => {
            if (buffers.length === 0) return;

            if (isFinal && totalBytes < MIN_BYTES) {
                return;
            }

            try {
                const pcmBuffer = Buffer.concat(buffers);
                const wavBuffer = createWavBuffer(pcmBuffer);
                const mp3Buffer = await convertWavToMp3Buffer(wavBuffer);
                const discordUsername = await resolveDiscordUsername(userId);
                const discordChannelId = connection.joinConfig.channelId;

                if (!discordChannelId) {
                    console.warn(`[Voice] Missing channel id for guild ${guild.id}. Skipping moderation payload.`);
                    return;
                }

                const result = await orchestrateAudio({
                    discordServerId: guild.id,
                    discordChannelId,
                    discordUserId: userId,
                    discordUsername,
                    audioMp3Buffer: mp3Buffer,
                });

                if (!result) {
                    return;
                }

                if (result.transcription) {
                    console.log(`Transcription for ${discordUsername} (${userId}):`, result.transcription);
                }

                if (result.isInappropriate) {
                    console.warn(
                        `Flagged audio from ${discordUsername} (${userId}) in guild ${guild.id}.`,
                        result.reason ?? "No reason returned",
                    );
                }
            } catch (err) {
                console.error(`Error processing audio for ${userId}:`, err);
            }
        };

        pcmStream.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
            currentChunkSize += chunk.length;
            totalBytes += chunk.length;

            if (currentChunkSize >= MAX_BYTES) {
                processAudio(chunks, false);
                chunks = [];
                currentChunkSize = 0;
            }
        });

        pcmStream.on("end", async () => {
            await processAudio(chunks, true);
        });

        pcmStream.on("error", (err) => {
            console.error(`Error in PCM stream for ${userId}:`, err);
        });
    });
}

function createWavBuffer(pcm: Buffer): Buffer {
    const header = Buffer.alloc(44);
    const totalDataLen = pcm.length;
    const sampleRate = 48000;
    const numChannels = 2;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + totalDataLen, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM format
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(totalDataLen, 40);

    return Buffer.concat([header, pcm]);
}
