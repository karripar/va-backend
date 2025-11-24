import express from 'express';
import { addDocumentLink, validateDocumentLink,
getPlatformInstructions, getDocuments} from "../controllers/linkuploadController";


const router = express.Router();


router.get('/documents/platforms', getPlatformInstructions);
router.get('/documents', getDocuments);
router.post('/documents/validate', validateDocumentLink);

// Document routes
router.post('/documents/link', addDocumentLink);
router.post('/documents', addDocumentLink);


export default router;
