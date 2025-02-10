// src/utils/resizeAndSave.ts

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { encryptData } from './encryptDecrypt';
import { logger } from './logger';

const maxHeight = parseInt(process.env.MAX_HEIGHT || '3200');
const maxWidth = parseInt(process.env.MAX_WIDTH || '3200');
const baseUploadDir = process.env.BASE_UPLOAD_DIR || 'uploads';

export const resizeAndSave = async (file: Express.Multer.File) => {
  try {
    const mimeType = file.mimetype;
    let ext = path.extname(file.originalname).toLowerCase().replace('.', '');

    const date = new Date();
    const yearMonth = `${date.getFullYear()}_${date.getMonth() + 1}`;
    const day = `${date.getDate()}`;

    const saveDir = path.join(baseUploadDir, yearMonth, day);
    fs.mkdirSync(saveDir, { recursive: true });

    let savedFilePath: string;

    if (mimeType.startsWith('image/')) {
      savedFilePath = path.join(saveDir, `${path.basename(file.filename, path.extname(file.filename))}.webp`);

      await sharp(file.path)
        .rotate()
        .resize(maxWidth, maxHeight, {
          fit: sharp.fit.inside,
          withoutEnlargement: true,
        })
        .toFormat('webp')
        .toFile(savedFilePath);

      fs.unlinkSync(file.path); // Remove the original file after processing
      ext = 'webp';
    } else {
      savedFilePath = path.join(saveDir, file.filename);
      fs.renameSync(file.path, savedFilePath);
    }

    const encryptedPath = encryptData(savedFilePath);

    return {
      filename: path.basename(savedFilePath),
      hash: encryptedPath,
      ext: ext,
      path: savedFilePath
    };

  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error resizing and saving file: ${error.message}`);
    } else {
      logger.error('Unknown error occurred during file processing');
    }
    throw new Error('Error processing file');
  }
  
};
