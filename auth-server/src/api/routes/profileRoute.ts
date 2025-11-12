import { Router } from "express";
import {
  getProfilePage,
  updateProfile,
  createProfile,
  addFavorite,
  getProfile,
  removeFavorite,
  //addDocument,
  removeDocument,
  getApplicationStages,
  getApplications,
  createApplication,
  updateApplicationPhase,
  getApplicationDocuments,
  addApplicationDocument,
  removeApplicationDocument,
  submitApplicationPhase,
  approveApplication,
  getRequiredDocuments,
  updateStageStatus,
  // Budget Management
  getBudgetCategories,
  createOrUpdateBudgetEstimate,
  getBudgetEstimate,
  // Erasmus+ Grants
  getErasmusGrantTypes,
  applyForErasmusGrant,
  updateErasmusGrant,
  getUserErasmusGrants,
  // Kela Support
  applyForKelaSupport,
  updateKelaSupport,
  getKelaSupport,
  // Grant Calculator & Search
  calculateTotalGrants,
  searchGrants,
  getAllGrantsSummary,
} from "../controllers/profileController";

const router = Router();

// Profile routes
router.get("/", getProfile);
router.post("/", createProfile);

// Application routes
router.get("/applications/stages", getApplicationStages);
router.put("/applications/stages/:stageId", updateStageStatus);
router.get("/applications", getApplications);
router.post("/applications", createApplication);
router.put("/applications/:phase", updateApplicationPhase);
router.get("/applications/:phase/documents", getApplicationDocuments);
router.get("/applications/:phase/required-documents", getRequiredDocuments);
router.post("/applications/documents", addApplicationDocument);
router.delete("/applications/documents/:documentId", removeApplicationDocument);
router.post("/applications/:phase/submit", submitApplicationPhase);
router.post("/applications/:id/approve", approveApplication);

// Budget Management routes
router.get("/grants/budget/categories", getBudgetCategories);
router.post("/budget-estimate", createOrUpdateBudgetEstimate);
router.get("/budget-estimate", getBudgetEstimate);

// Erasmus+ Grant routes
router.get("/grants/erasmus/types", getErasmusGrantTypes);
router.post("/grants/erasmus/apply", applyForErasmusGrant);
router.put("/grants/erasmus/:grantId", updateErasmusGrant);
router.get("/grants/erasmus", getUserErasmusGrants);

// Kela Support routes
router.post("/grants/kela/apply", applyForKelaSupport);
router.put("/grants/kela/:kelaId", updateKelaSupport);
router.get("/grants/kela", getKelaSupport);

// Grant Calculator & Search routes
router.post("/grants/calculator", calculateTotalGrants);
router.get("/grants/search", searchGrants);
router.get("/grants/summary", getAllGrantsSummary);

// Favorites routes
router.post("/favorites", addFavorite);
router.delete("/favorites", removeFavorite);

// Document routes (link-based system)
router.post("/documents", addDocument);
router.delete("/documents/:docId", removeDocument);

// Parameterized routes come LAST
router.get("/:id", getProfilePage);
router.put("/:id", updateProfile);

export default router;
