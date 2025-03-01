import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { encryptData, decryptData } from '../utils/encryptDecrypt';
import { resizeAndSave } from '../utils/resizeAndSave';

// Upload a single file
export const uploadSingleFile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return; // Ensure function exits after sending response
    }
  
    const result = await resizeAndSave(req.file);
  
    logger.info(`Uploaded file: ${req.file.filename}`);
    res.status(201).json({ success: true, data: result });
});
  

// Upload multiple files
export const uploadMultipleFiles = asyncHandler(async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ success: false, message: 'No files uploaded' });
      return; // Ensure function exits after sending error response
    }
  
    const results = await Promise.all(req.files.map(file => resizeAndSave(file))); // Added await
  
    results.forEach(file => logger.info(`Uploaded file: ${file.filename}`));
    
    res.status(201).json({ success: true, data: results });
});
  

// Get media file by hash
export const getMediaFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { hash } = req.params;
    const filePath = decryptData(hash);

    console.log('Decrypted file path:', filePath);  // Log the file path for debugging

    if (!filePath || !fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        res.status(404).json({ success: false, message: 'File not found' });
        return
    }

    res.sendFile(path.resolve(filePath), (err) => {
        if (err) {
            console.error('Error sending file:', err.message);
            if (!res.headersSent) {  // Check if headers have already been sent
                res.status(500).json({ success: false, message: 'Error sending file' });
            }
        }
    });
});

// Delete media file by hash
export const deleteMediaFile = asyncHandler(async (req: Request, res: Response) => {
  const { hash } = req.params;
  const filePath = decryptData(hash);

  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, message: 'File not found' });
    return
  }

  await fs.promises.unlink(filePath);
  logger.info(`Deleted file: ${filePath}`);

  res.status(200).json({ success: true, message: 'File deleted successfully' });
});

// Get file information by hash
export const getFileInfo = asyncHandler(async (req: Request, res: Response) => {
  const { hash } = req.params;
  const filePath = decryptData(hash);

  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, message: 'File not found' });
    return
  }

  const stats = await fs.promises.stat(filePath);

  res.status(200).json({
    success: true,
    data: {
      filename: path.basename(filePath),
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    }
  });
});
