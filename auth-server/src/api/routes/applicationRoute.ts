import { Router } from "express";
import {getApplicationStages, getApplications, createApplication, updateApplicationPhase, getApplicationDocuments, addApplicationDocument, removeApplicationDocument,
  submitApplicationPhase, approveApplication, getRequiredDocuments, updateStageStatus,} from "../controllers/profileController";

const router = Router();

// Application stage
router.get("/stages", getApplicationStages);
router.put("/stages/:stageId", updateStageStatus);

// Application CRUD
router.get("/", getApplications);
router.post("/", createApplication);
router.put("/:phase", updateApplicationPhase);
router.post("/:phase/submit", submitApplicationPhase);
router.post("/:id/approve", approveApplication);

// Application document
router.get("/:phase/documents", getApplicationDocuments);
router.get("/:phase/required-documents", getRequiredDocuments);
router.post("/documents", addApplicationDocument);
router.delete("/documents/:documentId", removeApplicationDocument);

export default router;
