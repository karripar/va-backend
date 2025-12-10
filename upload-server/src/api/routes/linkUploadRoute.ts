import express from 'express';
import { addDocumentLink, validateDocumentLink,
getPlatformInstructions, getDocuments, addApplicationDocumentLink} from "../controllers/linkuploadController";
//import { authenticate } from '../../middlewares';

/**
 * @apiDefine LinkUploadGroup Link Upload
 * Document link upload and management routes
 */

const router = express.Router();

router.get(
  /**
   * @api {get} /linkUploads/documents/platforms Get platform instructions
   * @apiName GetPlatformInstructions
   * @apiGroup LinkUploadGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve instructions for sharing documents from various cloud platforms
   * @apiPermission none
   *
   * @apiSuccess (200) {Object} platforms Platform instructions object
   * @apiSuccess (200) {Object} platforms.google_drive Google Drive sharing instructions
   * @apiSuccess (200) {Object} platforms.onedrive OneDrive sharing instructions
   * @apiSuccess (200) {Object} platforms.dropbox Dropbox sharing instructions
   * @apiSuccess (200) {Object} platforms.icloud iCloud sharing instructions
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "platforms": {
   *     "google_drive": { "instructions": "..." },
   *     "onedrive": { "instructions": "..." }
   *   }
   * }
   */
  '/documents/platforms',
  getPlatformInstructions
);

router.get(
  /**
   * @api {get} /linkUploads/documents Get all documents
   * @apiName GetDocuments
   * @apiGroup LinkUploadGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve all document links, optionally filtered by userId or applicationId
   * @apiPermission none
   *
   * @apiQuery {String} [userId] Filter documents by user ID
   * @apiQuery {String} [applicationId] Filter documents by application ID
   *
   * @apiSuccess (200) {Object[]} documents List of document links
   * @apiSuccess (200) {String} documents.userId User ID who added the document
   * @apiSuccess (200) {String} documents.name Document name
   * @apiSuccess (200) {String} documents.url Document URL
   * @apiSuccess (200) {String} documents.sourceType Source platform type
   * @apiSuccess (200) {String} documents.addedAt Date when document was added
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "userId": "123",
   *     "name": "My Document",
   *     "url": "https://drive.google.com/...",
   *     "sourceType": "google_drive",
   *     "addedAt": "2025-11-29T10:00:00.000Z"
   *   }
   * ]
   */
  '/documents',
  getDocuments
);

router.post(
  /**
   * @api {post} /linkUploads/documents/validate Validate document link
   * @apiName ValidateDocumentLink
   * @apiGroup LinkUploadGroup
   * @apiVersion 1.0.0
   * @apiDescription Validate if a document link is properly formatted and accessible
   * @apiPermission none
   *
   * @apiBody {String} url The document URL to validate
   * @apiBody {String} sourceType The source platform type (google_drive, onedrive, dropbox, icloud, other_url)
   *
   * @apiSuccess (200) {Boolean} isValid Whether the URL format is valid for the platform
   * @apiSuccess (200) {Boolean} isAccessible Whether the URL is accessible
   * @apiSuccess (200) {String} errorMessage Error message if validation failed
   * @apiSuccess (200) {String} checkedAt Timestamp of validation check
   * @apiSuccess (200) {String} platform Source platform type
   *
   * @apiError (400) {String} error Error message
   * @apiError (400) {String} details Details about missing fields
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "isValid": true,
   *   "isAccessible": true,
   *   "errorMessage": null,
   *   "checkedAt": "2025-11-29T10:00:00.000Z",
   *   "platform": "google_drive"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Missing required fields",
   *   "details": "url and sourceType are required"
   * }
   */
  '/documents/validate',
  validateDocumentLink
);

router.post(
  /**
   * @api {post} /linkUploads/documents/link Add document link
   * @apiName AddDocumentLink
   * @apiGroup LinkUploadGroup
   * @apiVersion 1.0.0
   * @apiDescription Add a new document link from cloud storage or external URL
   * @apiPermission authenticated
   *
   * @apiBody {String} name Document name
   * @apiBody {String} url Document URL
   * @apiBody {String} sourceType Source platform type (google_drive, onedrive, dropbox, icloud, other_url)
   * @apiBody {String} [notes] Optional notes about the document
   *
   * @apiSuccess (201) {Object} document Created document object
   * @apiSuccess (201) {String} document.userId User ID who added the document
   * @apiSuccess (201) {String} document.name Document name
   * @apiSuccess (201) {String} document.url Document URL
   * @apiSuccess (201) {String} document.sourceType Source platform type
   * @apiSuccess (201) {String} document.addedAt Date when document was added
   * @apiSuccess (201) {Boolean} document.isAccessible Whether document is accessible
   * @apiSuccess (201) {String} document.accessPermission Access permission level
   *
   * @apiError (400) {String} error Error message
   * @apiError (400) {String} details Details about missing fields or invalid source type
   * @apiError (401) {String} error User not authenticated
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "userId": "123",
   *   "name": "My Document",
   *   "url": "https://drive.google.com/...",
   *   "sourceType": "google_drive",
   *   "addedAt": "2025-11-29T10:00:00.000Z",
   *   "isAccessible": true,
   *   "accessPermission": "public"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Invalid source type",
   *   "validTypes": ["google_drive", "onedrive", "dropbox", "icloud", "other_url"]
   * }
   */
  '/documents/link',
  addDocumentLink
);

router.post(
  /**
   * @api {post} /linkUploads/documents:1 Add application document link
   * @apiName AddApplicationDocumentLink
   * @apiGroup LinkUploadGroup
   * @apiVersion 1.0.0
   * @apiDescription Add a document link for application phase
   * @apiPermission authenticated
   *
   * @apiBody {String} phase Application phase
   * @apiBody {String} documentType Document type
   * @apiBody {String} fileName File name
   * @apiBody {String} fileUrl File URL
   * @apiBody {String} sourceType Source platform type
   * @apiBody {String} [notes] Optional notes
   *
   * @apiSuccess (201) {Object} document Created document object
   *
   * @apiError (400) {String} error Error message
   * @apiError (401) {String} error User not authenticated
   */
  '/documents',
  addApplicationDocumentLink
);


export default router;
