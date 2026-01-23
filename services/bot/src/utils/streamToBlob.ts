import { Readable } from 'stream';

export async function streamToBlob(stream) {
  const response = new Response(stream);
  const blob = await response.blob(); // This consumes the stream and returns a Promise
  return blob;
}