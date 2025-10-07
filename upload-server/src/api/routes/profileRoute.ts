import express from 'express';
import {upload, uploadAvatar, uploadDocument} from '../controllers/profileController';

const router = express.Router();

router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/document', upload.single('document'), uploadDocument);

export default router;