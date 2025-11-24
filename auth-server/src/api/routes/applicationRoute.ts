import { Router } from "express";
import {getApplicationStages, getApplications, createApplication, updateApplicationPhase, getApplicationDocuments, addApplicationDocument, removeApplicationDocument,
  submitApplicationPhase, approveApplication, getRequiredDocuments, updateStageStatus,} from "../controllers/profileController";

const router = Router();

// Application stage
router.get("/stages", getApplicationStages);
router.put("/stages/:stageId", updateStageStatus);
/**
 * @api {put} /applications/stages/:stageId Update application stage status
 * @apiName UpdateStageStatus
 * @apiGroup Applications
 * @apiParam {String} stageId Stage's unique ID
 */
router.put("/stages/:stageId", updateStageStatus);

// Application CRUD
router.get("/", getApplications);
router.post("/", createApplication);
/**
 * @api {put} /applications/:phase Update application phase
 * @apiName UpdateApplicationPhase
 * @apiGroup Applications
 * @apiParam {String} phase Application phase identifier
 */
router.put("/:phase", updateApplicationPhase);
/**
 * @api {post} /applications/:phase/submit Submit application phase
 * @apiName SubmitApplicationPhase
 * @apiGroup Applications
 * @apiParam {String} phase Application phase identifier
 */
router.post("/:phase/submit", submitApplicationPhase);
/**
 * @api {post} /applications/:id/approve Approve application
 * @apiName ApproveApplication
 * @apiGroup Applications
 * @apiParam {String} id Application's unique ID
 */
router.post("/:id/approve", approveApplication);

// Application document
router.get("/:phase/documents", getApplicationDocuments);
router.get("/:phase/required-documents", getRequiredDocuments);
router.post("/documents", addApplicationDocument);
router.delete("/documents/:documentId", removeApplicationDocument);
/**
 * @api {get} /applications/:phase/documents Get application documents
 * @apiName GetApplicationDocuments
 * @apiGroup Applications
 * @apiParam {String} phase Application phase identifier
 */
router.get("/:phase/documents", getApplicationDocuments);
/**
 * @api {get} /applications/:phase/required-documents Get required documents for phase
 * @apiName GetRequiredDocuments
 * @apiGroup Applications
 * @apiParam {String} phase Application phase identifier
 */
router.get("/:phase/required-documents", getRequiredDocuments);
router.post("/documents", addApplicationDocument);
/**
 * @api {delete} /applications/documents/:documentId Remove application document
 * @apiName RemoveApplicationDocument
 * @apiGroup Applications
 * @apiParam {String} documentId Document's unique ID
 */
router.delete("/documents/:documentId", removeApplicationDocument);

export default router;
