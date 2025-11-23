import express from 'express';
import {upload, uploadAvatar, uploadDocument, uploadApplicationDocument, addDocumentLink, validateDocumentLink,
getPlatformInstructions, getDocuments} from "../controllers/services/linkUploadService";


const router = express.Router();


router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/document', upload.single('document'), uploadDocument);
router.post('/applications/upload', upload.single('file'), uploadApplicationDocument);


router.get('/documents/platforms', getPlatformInstructions);
router.get('/documents', getDocuments);
router.post('/documents/validate', validateDocumentLink);

// Document routes 
router.post('/documents/link', addDocumentLink);
router.post('/documents', addDocumentLink); 

/*
// Application document routes 
router.post('/applications/documents/link', addApplicationDocumentLink);
router.post('/applications/documents', addApplicationDocumentLink); 
*/

export default router;