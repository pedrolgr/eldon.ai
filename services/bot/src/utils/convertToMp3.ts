import ffmpeg from "fluent-ffmpeg";
import { unlink } from "fs";

export function convertToMp3(pcmPath: string, mp3Path: string) {
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