import dotenv from 'dotenv';
import Groq from "groq-sdk";

dotenv.config();

const groq = new Groq();

export async function transcribeAudio(file: File) {

  const transcription = await groq.audio.transcriptions.create({
    file: file,
    model: "whisper-large-v3-turbo",
    temperature: 0,
    response_format: "verbose_json",
  });

  return transcription.text;
}
