import { EndBehaviorType, VoiceReceiver, VoiceConnection } from "@discordjs/voice";
import prism from "prism-media";
import { transcribeAudio } from "./transcribeAudio";

export function recordVoiceHandler(connection: VoiceConnection) {
    const receiver: VoiceReceiver = connection.receiver;

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
                const file = new File([wavBuffer as any], `recording-${userId}-${Date.now()}.wav`, { type: "audio/wav" });

                const text = await transcribeAudio(file);
                if (text) console.log(`Transcription for ${userId}:`, text);
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
