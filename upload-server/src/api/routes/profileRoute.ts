import express from 'express';
import {upload, uploadAvatar, uploadDocument, uploadApplicationDocument} from '../controllers/profileController';

const router = express.Router();

router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/document', upload.single('document'), uploadDocument);
router.post('/applications/upload', upload.single('file'), uploadApplicationDocument);

export default router;
