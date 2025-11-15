import { Router } from "express";
import {getErasmusGrantTypes, applyForErasmusGrant, updateErasmusGrant, getUserErasmusGrants,
  applyForKelaSupport, updateKelaSupport, getKelaSupport,
  calculateTotalGrants, searchGrants, getAllGrantsSummary, getBudgetCategories,} from "../controllers/profileController";

const router = Router();

// Budget categories for grants
router.get("/budget/categories", getBudgetCategories);

// Erasmus+ Grant routes
router.get("/erasmus/types", getErasmusGrantTypes);
router.post("/erasmus/apply", applyForErasmusGrant);
router.put("/erasmus/:grantId", updateErasmusGrant);
router.get("/erasmus", getUserErasmusGrants);

// Kela Support routes
router.post("/kela/apply", applyForKelaSupport);
router.put("/kela/:kelaId", updateKelaSupport);
router.get("/kela", getKelaSupport);

// Grant Calculator & Search routes
router.post("/calculator", calculateTotalGrants);
router.get("/search", searchGrants);
router.get("/summary", getAllGrantsSummary);

export default router;
