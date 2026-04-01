import { randomUUID } from "crypto";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

if (ffmpegStatic) {
    ffmpeg.setFfmpegPath(ffmpegStatic);
}

export async function convertWavToMp3Buffer(wavBuffer: Buffer): Promise<Buffer> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "discord-bot-audio-"));
    const wavPath = path.join(tempDir, `${randomUUID()}.wav`);
    const mp3Path = path.join(tempDir, `${randomUUID()}.mp3`);

    await fs.writeFile(wavPath, wavBuffer);

    try {
        await new Promise<void>((resolve, reject) => {
            ffmpeg(wavPath)
                .audioCodec("libmp3lame")
                .toFormat("mp3")
                .on("end", () => resolve())
                .on("error", (error) => reject(error))
                .save(mp3Path);
        });

        return await fs.readFile(mp3Path);
    } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
    }
}
