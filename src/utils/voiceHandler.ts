import { EndBehaviorType, VoiceReceiver, VoiceConnection } from "@discordjs/voice";
import { createWriteStream, existsSync, mkdirSync, unlink } from "fs";
import { pipeline } from "stream";
import prism from "prism-media";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

export function recordVoiceHandler(connection: VoiceConnection) {
    const receiver: VoiceReceiver = connection.receiver;

    const recordingsDir = path.join(process.cwd(), "recordings");
    if (!existsSync(recordingsDir)) {
        mkdirSync(recordingsDir, { recursive: true });
    }

    receiver.speaking.on("start", (userId: string) => {

        const opusStream = receiver.subscribe(userId, {
            end: {
                behavior: EndBehaviorType.AfterSilence,
                duration: 100,
            },
        });

        const pcmStream = new prism.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });

        const timestamp = Date.now();
        const pcmFileName = `record-${userId}-${timestamp}.pcm`;
        const pcmFilePath = path.join(recordingsDir, pcmFileName);
        const mp3FileName = `record-${userId}-${timestamp}.mp3`;
        const mp3FilePath = path.join(recordingsDir, mp3FileName);

        const out = createWriteStream(pcmFilePath);

        pipeline(opusStream, pcmStream, out, (err) => {
            if (err) {
                console.error(`Erro no pipeline do usuário ${userId}:`, err);
            }
        });

        opusStream.on("end", () => {

            ffmpeg(pcmFilePath)
                .inputFormat("s16le")
                .inputOptions([
                    "-ar 48000",
                    "-ac 2"
                ])
                .toFormat("mp3")
                .on("end", () => {
                    unlink(pcmFilePath, (err) => {
                        if (err) console.error(`Erro ao deletar PCM: ${err}`);
                    });
                })
                .on("error", (err) => {
                    console.error(`Erro na conversão para MP3: ${err.message}`);
                })
                .save(mp3FilePath);
        });

        opusStream.on("error", (err) => {
            console.error(`Erro no stream do usuário ${userId}:`, err);
        });
    });
}
