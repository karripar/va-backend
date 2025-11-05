import express from 'express';
import {
  upload,
  uploadAvatar,
  uploadDocument,
  uploadApplicationDocument,
  addDocumentLink,
  addApplicationDocumentLink,
  validateDocumentLink,
  getPlatformInstructions
} from '../controllers/profileController';

const router = express.Router();


router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/document', upload.single('document'), uploadDocument);
router.post('/applications/upload', upload.single('file'), uploadApplicationDocument);


router.get('/documents/platforms', getPlatformInstructions);
router.post('/documents/link', addDocumentLink);
router.post('/documents/validate', validateDocumentLink);
router.post('/applications/documents/link', addApplicationDocumentLink);

export default router;
