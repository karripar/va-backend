import express from 'express';
import multer from 'multer';
import {authenticate} from '../../middlewares';
import {
  deleteUploadedDocument,
  uploadDocument,
  listDocuments,
} from '../controllers/uploadController';
import path from 'path';

/**
 * @apiDefine FileUploadGroup File Upload
 * File upload routes for documents (PDF, PPT, PPTX, DOC, DOCX)
 */

/**
 * @apiDefine token Token is required in the form of Bearer token
 * @apiHeader {String} Authorization Bearer token
 * @apiHeaderExample {json} Header-Example:
 * {
 *  "Authorization": "Bearer <token>"
 * }
 */

/**
 * @apiDefine unauthorized Unauthorized
 * @apiError (401) {String} Unauthorized User is not authorized
 * @apiErrorExample {json} Unauthorized:
 * {
 *  "message": "Unauthorized"
 * }
 */

// configure storage for document uploads
const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';

const documentStorage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    // extension
    const extension = path.extname(file.originalname).toLowerCase();
    // basename for file
    let baseName = path.basename(file.originalname, extension);

    // sanitize filename
    baseName = baseName.replace(/[^\w-]/g, '_');

    // timestamp to make it unique
    const timestamp = Date.now();
    // new filename: baseName_timestamp.extension
    const newName = `${baseName}_${timestamp}${extension}`;
    cb(null, newName);
  },
});

// configure multer for document uploads
const upload = multer({
  storage: documentStorage,
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
  limits: {fileSize: 20 * 1024 * 1024}, // 20MB
});

const router = express.Router();

router.get(
  /**
   * @api {get} /list List uploaded documents
   * @apiName ListUploadedDocuments
   * @apiGroup FileUploadGroup
   * @apiVersion 1.0.0
   * @apiDescription List all uploaded documents
   * @apiPermission admin
   *
   * @apiUse token
   *
   * @apiSuccess (200) {Object[]} data List of uploaded documents
   * @apiSuccess (200) {String} data.filename Filename of the uploaded document
   * @apiSuccess (200) {String} data.url Public URL of the document
   * @apiSuccess (200) {String} data.media_type MIME type of the document
   * @apiSuccess (200) {Number} data.filesize Size of the document in bytes
   *
   * @apiError (401) {String} Unauthorized User is not authorized
   * @apiErrorExample {json} Unauthorized:
   * {
   *  "message": "Forbidden: admin only"
   * }
   */
  '/list',
  authenticate,
  listDocuments
);

router.post(
  /**
   * @api {post} /upload Upload a document
   * @apiName UploadDocument
   * @apiGroup FileUploadGroup
   * @apiVersion 1.0.0
   * @apiDescription Upload a document file (PDF, PPT, PPTX, DOC, DOCX)
   * @apiPermission admin
   *
   * @apiUse token
   *
   * @apiBody {File} file Document file to upload
   *
   * @apiSuccess (200) {Object} data File data
   * @apiSuccess (200) {String} data.filename Filename of the uploaded file
   * @apiSuccess (200) {String} data.url Public URL of the file
   * @apiSuccess (200) {String} data.media_type MIME type of the file
   * @apiSuccess (200) {Number} data.filesize Size of the file in bytes
   * @apiSuccess (200) {String} message Success message
   *
   * @apiError (400) {String} No valid file No valid file provided
   * @apiError (401) {String} Unauthorized Only admins can upload documents
   * @apiError (413) {String} File too large File size exceeds 20MB limit
   */
  '/upload',
  authenticate,
  upload.single('file'),
  uploadDocument
);

router.delete(
  /**
   * @api {delete} /delete/:filename Delete a file
   * @apiName DeleteFile
   * @apiGroup FileUploadGroup
   * @apiVersion  1.0.0
   * @apiDescription Delete a file
   * @apiPermission token
   *
   * @apiUse token
   *
   * @apiParam {String} filename Filename of the file to delete
   *
   * @apiSuccess (200) {String} message Success message
   * @apiSuccessExample {json} Success-Response:
   * {
   *  "message": "File deleted"
   * }
   *
   * @apiError (400) {String} No filename provided No filename provided
   * @apiErrorExample {json} No filename provided:
   * {
   *  "message": "No filename provided"
   * }
   *
   * @apiError (401) {String} Unauthorized User is not authorized
   * @apiErrorExample {json} Unauthorized:
   * {
   *  "message": "Unauthorized"
   * }
   */
  '/delete/:filename',
  authenticate,
  deleteUploadedDocument
);

export default router;
