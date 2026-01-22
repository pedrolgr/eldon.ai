import { EndBehaviorType, VoiceReceiver, VoiceConnection } from "@discordjs/voice";
import { createWriteStream, existsSync, mkdirSync, unlink, WriteStream } from "fs";
import { PassThrough, pipeline } from "stream";
import prism from "prism-media";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

const recordingsDir = path.join(process.cwd(), "recordings");
if (!existsSync(recordingsDir)) {
    mkdirSync(recordingsDir, { recursive: true });
}

function convertToMp3(pcmPath: string, mp3Path: string) {
    ffmpeg(pcmPath)
        .inputFormat("s16le")
        .inputOptions([
            "-ar 48000",
            "-ac 2"
        ])
        .toFormat("mp3")
        .on("end", () => {
            unlink(pcmPath, (err) => {
                if (err) console.error(`Erro ao deletar PCM: ${err}`);
            });
        })
        .on("error", (err) => {
            console.error(`Erro na conversão para MP3: ${err.message}`);
        })
        .save(mp3Path);
}

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

        decoder.on("error", (err) => {
            console.error(`Erro no decodificador Opus para o usuário ${userId}:`, err);
        });

        const audioBuffer = new PassThrough();

        pipeline(opusStream, decoder, audioBuffer, (err) => {
            if (err && (err as any).code !== "ERR_STREAM_PREMATURE_CLOSE") {
                console.error(`Erro no pipeline do usuário ${userId}:`, err);
            }
        });

        let currentOut: WriteStream | null = null;
        let pcmPath: string = "";
        let timer: NodeJS.Timeout | null = null;

        const rotateFile = () => {
            const timestamp = Date.now();
            const newPcmPath = path.join(recordingsDir, `record-${userId}-${timestamp}.pcm`);

            if (currentOut) {
                audioBuffer.unpipe(currentOut);
                const closedPath = pcmPath;
                currentOut.end(() => {
                    const mp3Path = closedPath.replace(".pcm", ".mp3");
                    convertToMp3(closedPath, mp3Path);
                });
            }

            pcmPath = newPcmPath;
            currentOut = createWriteStream(pcmPath);
            audioBuffer.pipe(currentOut);
        };

        rotateFile();
        timer = setInterval(rotateFile, 10000);

        opusStream.on("end", () => {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }

            if (currentOut) {
                audioBuffer.unpipe(currentOut);
                const lastPcmPath = pcmPath;
                currentOut.end(() => {
                    const mp3Path = lastPcmPath.replace(".pcm", ".mp3");
                    convertToMp3(lastPcmPath, mp3Path);
                });
                currentOut = null;
            }
        });

        opusStream.on("error", (err) => {
            console.error(`Erro no stream do usuário ${userId}:`, err);
            if (timer) clearInterval(timer);
        });
    });
}
