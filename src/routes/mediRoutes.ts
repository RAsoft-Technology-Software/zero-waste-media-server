import express from 'express';
import { protect } from '../middlewares/auth';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteMediaFile,
  getMediaFile,
  getFileInfo
} from '../controllers/mediaController';
import { upload } from '../utils/multer';

const router = express.Router();

// Public route to fetch media file
router.get('/:hash', getMediaFile);

// Upload routes (protected)
router.post('/upload', /* protect, */ upload.single('file'), uploadSingleFile);
router.post('/uploads', /* protect, */ upload.array('files', 10), uploadMultipleFiles);

// Delete route (protected)
router.delete('/:hash', /* protect, */ deleteMediaFile);

// Get file info (protected)
router.get('/info/:hash', /* protect, */ getFileInfo);

export default router;
