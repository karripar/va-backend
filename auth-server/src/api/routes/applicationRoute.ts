import { Router } from "express";
import {getApplicationStages, getApplications, createApplication, updateApplicationPhase, getApplicationDocuments, addApplicationDocument, removeApplicationDocument,
  submitApplicationPhase, approveApplication, getRequiredDocuments, updateStageStatus,} from "../controllers/profileController";

/**
 * @apiDefine ApplicationsGroup Applications
 * Application management and document handling
 */

const router = Router();

router.get(
  /**
   * @api {get} /applications/stages Get application stages
   * @apiName GetApplicationStages
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve all application stages with user progress
   * @apiPermission authenticated
   * 
   * @apiSuccess (200) {Object[]} stages List of application stages
   * @apiSuccess (200) {String} stages.id Stage unique ID
   * @apiSuccess (200) {String} stages.name Stage name
   * @apiSuccess (200) {Number} stages.order Stage order
   * @apiSuccess (200) {String} stages.status User's status for this stage
   * @apiSuccess (200) {String} stages.completedAt Completion timestamp
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "stages": [
   *     {
   *       "id": "stage1",
   *       "name": "Application Form",
   *       "order": 1,
   *       "status": "completed",
   *       "completedAt": "2025-11-29T10:00:00.000Z"
   *     }
   *   ]
   * }
   */
  "/stages",
  getApplicationStages
);

router.put(
  /**
   * @api {put} /applications/stages/:stageId Update application stage status
   * @apiName UpdateStageStatus
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Update the status of a specific application stage
   * @apiPermission authenticated
   * 
   * @apiParam {String} stageId Stage's unique ID
   * @apiBody {String} status New status for the stage
   * 
   * @apiSuccess (200) {Object} stage Updated stage object
   * @apiSuccess (200) {String} message Success message
   * 
   * @apiError (400) {String} error Invalid status or stage ID
   * @apiError (404) {String} error Stage not found
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "stage": {
   *     "id": "stage1",
   *     "status": "completed"
   *   },
   *   "message": "Stage status updated successfully"
   * }
   */
  "/stages/:stageId",
  updateStageStatus
);

router.get(
  /**
   * @api {get} /applications Get user applications
   * @apiName GetApplications
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve all applications for the authenticated user
   * @apiPermission authenticated
   * 
   * @apiSuccess (200) {Object} applications User applications object
   * @apiSuccess (200) {String} applications.userId User ID
   * @apiSuccess (200) {String} applications.currentPhase Current application phase
   * @apiSuccess (200) {Object[]} applications.applications List of application phases
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "userId": "123",
   *   "currentPhase": "academic_year",
   *   "applications": []
   * }
   */
  "/",
  getApplications
);

router.post(
  /**
   * @api {post} /applications Create application
   * @apiName CreateApplication
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Create a new application or update existing one for a specific phase
   * @apiPermission authenticated
   * 
   * @apiBody {String} phase Application phase (academic_year, semester, required_documents, etc.)
   * @apiBody {Object} data Phase-specific application data
   * 
   * @apiSuccess (201) {Object} application Created/updated application
   * 
   * @apiError (400) {String} error Missing required fields
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "userId": "123",
   *   "currentPhase": "academic_year",
   *   "applications": [
   *     {
   *       "phase": "academic_year",
   *       "data": { "year": "2025-2026" },
   *       "status": "draft"
   *     }
   *   ]
   * }
   */
  "/",
  createApplication
);

router.put(
  /**
   * @api {put} /applications/:phase Update application phase
   * @apiName UpdateApplicationPhase
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Update data for a specific application phase
   * @apiPermission authenticated
   * 
   * @apiParam {String} phase Application phase identifier
   * @apiBody {Object} data Updated phase data
   * 
   * @apiSuccess (200) {Object} application Updated application object
   * 
   * @apiError (404) {String} error Application or phase not found
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "userId": "123",
   *   "currentPhase": "semester",
   *   "applications": [...]
   * }
   */
  "/:phase",
  updateApplicationPhase
);

router.post(
  /**
   * @api {post} /applications/:phase/submit Submit application phase
   * @apiName SubmitApplicationPhase
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Submit an application phase for review (validates required documents)
   * @apiPermission authenticated
   * 
   * @apiParam {String} phase Application phase identifier
   * 
   * @apiSuccess (200) {Object} application Updated application with submitted status
   * 
   * @apiError (400) {String} error Missing required documents
   * @apiError (404) {String} error Application or phase not found
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "userId": "123",
   *   "applications": [
   *     {
   *       "phase": "required_documents",
   *       "status": "submitted",
   *       "submittedAt": "2025-11-29T10:00:00.000Z"
   *     }
   *   ]
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Missing required documents",
   *   "missing": ["passport", "transcript"]
   * }
   */
  "/:phase/submit",
  submitApplicationPhase
);

router.post(
  /**
   * @api {post} /applications/:id/approve Approve application
   * @apiName ApproveApplication
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Approve a submitted application (admin only)
   * @apiPermission admin
   * 
   * @apiParam {String} id User's unique ID
   * @apiBody {String} phase Application phase to approve
   * @apiBody {String} [reviewNotes] Optional review notes
   * 
   * @apiSuccess (200) {Object} application Updated application with approved status
   * 
   * @apiError (404) {String} error Application not found
   * @apiError (403) {String} error Unauthorized
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "userId": "123",
   *   "applications": [
   *     {
   *       "phase": "required_documents",
   *       "status": "approved",
   *       "reviewedBy": "admin123",
   *       "reviewedAt": "2025-11-29T10:00:00.000Z"
   *     }
   *   ]
   * }
   */
  "/:id/approve",
  approveApplication
);

router.get(
  /**
   * @api {get} /applications/:phase/documents Get application documents
   * @apiName GetApplicationDocuments
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve all documents for a specific application phase
   * @apiPermission authenticated
   * 
   * @apiParam {String} phase Application phase identifier
   * 
   * @apiSuccess (200) {Object[]} documents List of documents for the phase
   * @apiSuccess (200) {String} documents.id Document ID
   * @apiSuccess (200) {String} documents.documentType Document type
   * @apiSuccess (200) {String} documents.fileName File name
   * @apiSuccess (200) {String} documents.fileUrl File URL
   * @apiSuccess (200) {String} documents.sourceType Source type (upload/link)
   * @apiSuccess (200) {String} documents.addedAt Date added
   * 
   * @apiError (404) {String} error Application or phase not found
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "id": "doc123",
   *     "documentType": "passport",
   *     "fileName": "passport.pdf",
   *     "fileUrl": "https://...",
   *     "sourceType": "google_drive",
   *     "addedAt": "2025-11-29T10:00:00.000Z"
   *   }
   * ]
   */
  "/:phase/documents",
  getApplicationDocuments
);

router.get(
  /**
   * @api {get} /applications/:phase/required-documents Get required documents
   * @apiName GetRequiredDocuments
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Get the list of required documents for a specific application phase
   * @apiPermission none
   * 
   * @apiParam {String} phase Application phase identifier
   * 
   * @apiSuccess (200) {Object[]} documents List of required document types
   * @apiSuccess (200) {String} documents.type Document type identifier
   * @apiSuccess (200) {String} documents.name Display name of document
   * 
   * @apiError (404) {String} error Phase not found
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "type": "passport",
   *     "name": "Valid Passport"
   *   },
   *   {
   *     "type": "transcript",
   *     "name": "Academic Transcript"
   *   }
   * ]
   */
  "/:phase/required-documents",
  getRequiredDocuments
);

router.post(
  /**
   * @api {post} /applications/documents Add application document
   * @apiName AddApplicationDocument
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Add a document link to an application phase
   * @apiPermission authenticated
   * 
   * @apiBody {String} phase Application phase
   * @apiBody {String} documentType Type of document
   * @apiBody {String} fileName File name
   * @apiBody {String} fileUrl File URL
   * @apiBody {String} sourceType Source type (google_drive, onedrive, dropbox, etc.)
   * @apiBody {String} [notes] Optional notes
   * 
   * @apiSuccess (201) {Object} document Created document object
   * @apiSuccess (201) {String} document.id Document ID
   * @apiSuccess (201) {String} document.documentType Document type
   * @apiSuccess (201) {String} document.fileUrl File URL
   * 
   * @apiError (400) {String} error Missing required fields or invalid source type
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "id": "doc123",
   *   "documentType": "passport",
   *   "fileName": "passport.pdf",
   *   "fileUrl": "https://drive.google.com/...",
   *   "sourceType": "google_drive",
   *   "addedAt": "2025-11-29T10:00:00.000Z"
   * }
   */
  "/documents",
  addApplicationDocument
);

router.delete(
  /**
   * @api {delete} /applications/documents/:documentId Remove application document
   * @apiName RemoveApplicationDocument
   * @apiGroup ApplicationsGroup
   * @apiVersion 1.0.0
   * @apiDescription Remove a document from an application
   * @apiPermission authenticated
   * 
   * @apiParam {String} documentId Document's unique ID
   * 
   * @apiSuccess (204) No content
   * 
   * @apiError (404) {String} error Document not found
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 204 No Content
   */
  "/documents/:documentId",
  removeApplicationDocument
);

export default router;
