import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Constants for optimization
const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_QUALITY = 60;
const FULL_IMAGE_WIDTH = 1200;
const FULL_IMAGE_QUALITY = 80;
const VIDEO_BITRATE = '800k';
const VIDEO_THUMB_BITRATE = '400k';

interface ProcessedMedia {
  thumbnail: string;
  full: string;
}

export async function compressImage(buffer: Buffer): Promise<ProcessedMedia> {
  // Generate thumbnail
  const thumbnail = await sharp(buffer)
    .resize(THUMBNAIL_WIDTH, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .jpeg({ 
      quality: THUMBNAIL_QUALITY,
      progressive: true 
    })
    .toBuffer();

  // Generate optimized full-size image
  const full = await sharp(buffer)
    .resize(FULL_IMAGE_WIDTH, null, {
      withoutEnlargement: true,
      fit: 'inside'
    })
    .jpeg({ 
      quality: FULL_IMAGE_QUALITY,
      progressive: true
    })
    .toBuffer();

  return {
    thumbnail: `data:image/jpeg;base64,${thumbnail.toString('base64')}`,
    full: `data:image/jpeg;base64,${full.toString('base64')}`
  };
}

export async function compressVideo(buffer: Buffer): Promise<ProcessedMedia> {
  const tempInput = join(tmpdir(), `${uuidv4()}-input.mp4`);
  const tempOutput = join(tmpdir(), `${uuidv4()}-output.mp4`);
  const tempThumb = join(tmpdir(), `${uuidv4()}-thumb.mp4`);

  await fs.writeFile(tempInput, buffer);

  const processVideo = async (outputPath: string, bitrate: string, size: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .videoBitrate(bitrate)
        .size(size)
        .on('end', async () => {
          try {
            const processedBuffer = await fs.readFile(outputPath);
            await fs.unlink(outputPath);
            resolve(`data:video/mp4;base64,${processedBuffer.toString('base64')}`);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          fs.unlink(outputPath).catch(console.error);
          reject(err);
        })
        .save(outputPath);
    });
  };

  try {
    const [thumbnail, full] = await Promise.all([
      processVideo(tempThumb, VIDEO_THUMB_BITRATE, '480x?'),
      processVideo(tempOutput, VIDEO_BITRATE, '720x?')
    ]);

    await fs.unlink(tempInput);

    return { thumbnail, full };
  } catch (error) {
    await Promise.all([
      fs.unlink(tempInput).catch(() => {}),
      fs.unlink(tempOutput).catch(() => {}),
      fs.unlink(tempThumb).catch(() => {})
    ]);
    throw error;
  }
}

export function isVideo(mimetype: string): boolean {
  return mimetype.startsWith('video/');
}

export function isImage(mimetype: string): boolean {
  return mimetype.startsWith('image/');
}