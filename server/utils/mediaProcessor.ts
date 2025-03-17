import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const IMAGE_QUALITY = 80; // 0-100
const MAX_IMAGE_WIDTH = 1200;
const VIDEO_BITRATE = '1000k';
const VIDEO_MAX_SIZE = '10MB';

export async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(MAX_IMAGE_WIDTH, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .jpeg({ quality: IMAGE_QUALITY })
    .toBuffer();
}

export async function compressVideo(buffer: Buffer): Promise<string> {
  const tempInput = join(tmpdir(), `${uuidv4()}-input.mp4`);
  const tempOutput = join(tmpdir(), `${uuidv4()}-output.mp4`);
  
  await fs.writeFile(tempInput, buffer);
  
  return new Promise((resolve, reject) => {
    ffmpeg(tempInput)
      .videoBitrate(VIDEO_BITRATE)
      .size('?x720') // 720p height max
      .on('end', async () => {
        try {
          const compressedBuffer = await fs.readFile(tempOutput);
          const base64 = compressedBuffer.toString('base64');
          await fs.unlink(tempInput);
          await fs.unlink(tempOutput);
          resolve(`data:video/mp4;base64,${base64}`);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (err) => {
        fs.unlink(tempInput).catch(console.error);
        fs.unlink(tempOutput).catch(console.error);
        reject(err);
      })
      .save(tempOutput);
  });
}

export function isVideo(mimetype: string): boolean {
  return mimetype.startsWith('video/');
}

export function isImage(mimetype: string): boolean {
  return mimetype.startsWith('image/');
}
