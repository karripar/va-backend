import express from 'express';
import {/* upload, uploadAvatar, uploadDocument, uploadApplicationDocument, */ addDocumentLink, validateDocumentLink,
getPlatformInstructions, getDocuments} from "../controllers/services/linkUploadService";

/**
 * @apiDefine DocumentLinkBody
 * @apiParam {String} url The link to the document
 * @apiParam {String} [title] Optional title for the document
 * @apiParam {String} [description] Optional description
 */

/**
 * @apiDefine FileUpload
 * @apiParam {File} file The file to upload (form-data)
 */


const router = express.Router();


/**
 * @api {post} /link-upload/avatar Upload user avatar
 * @apiName UploadAvatar
 * @apiGroup LinkUpload
 * @apiParam {File} avatar Avatar image file (form-data)
 */
//router.post('/avatar', upload.single('avatar'), uploadAvatar);
/**
 * @api {post} /link-upload/document Upload document file
 * @apiName UploadDocument
 * @apiGroup LinkUpload
 * @apiParam {File} document Document file (form-data)
 */
//router.post('/document', upload.single('document'), uploadDocument);
/**
 * @api {post} /link-upload/applications/upload Upload application document file
 * @apiName UploadApplicationDocument
 * @apiGroup LinkUpload
 * @apiParam {File} file Application document file (form-data)
 */
//router.post('/applications/upload', upload.single('file'), uploadApplicationDocument);


/**
 * @api {get} /link-upload/documents/platforms Get platform instructions
 * @apiName GetPlatformInstructions
 * @apiGroup LinkUpload
 */
router.get('/documents/platforms', getPlatformInstructions);
/**
 * @api {get} /link-upload/documents Get all documents
 * @apiName GetDocuments
 * @apiGroup LinkUpload
 */
router.get('/documents', getDocuments);
/**
 * @api {post} /link-upload/documents/validate Validate document link
 * @apiName ValidateDocumentLink
 * @apiGroup LinkUpload
 * @apiUse DocumentLinkBody
 */
router.post('/documents/validate', validateDocumentLink);

// Document routes
/**
 * @api {post} /link-upload/documents/link Add document link
 * @apiName AddDocumentLink
 * @apiGroup LinkUpload
 * @apiUse DocumentLinkBody
 */
router.post('/documents/link', addDocumentLink);
/**
 * @api {post} /link-upload/documents Add document link (alias)
 * @apiName AddDocumentLinkAlias
 * @apiGroup LinkUpload
 * @apiUse DocumentLinkBody
 */
router.post('/documents', addDocumentLink);

/*
// Application document routes
router.post('/applications/documents/link', addApplicationDocumentLink);
router.post('/applications/documents', addApplicationDocumentLink);
*/

export default router;
