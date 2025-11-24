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
/**
 * @api {put} /grants/erasmus/:grantId Update Erasmus+ grant
 * @apiName UpdateErasmusGrant
 * @apiGroup Grants
 * @apiParam {String} grantId Erasmus+ grant unique ID
 */
router.put("/erasmus/:grantId", updateErasmusGrant);
router.get("/erasmus", getUserErasmusGrants);

// Kela Support routes
router.post("/kela/apply", applyForKelaSupport);
/**
 * @api {put} /grants/kela/:kelaId Update Kela support
 * @apiName UpdateKelaSupport
 * @apiGroup Grants
 * @apiParam {String} kelaId Kela support unique ID
 */
router.put("/kela/:kelaId", updateKelaSupport);
router.get("/kela", getKelaSupport);

// Grant Calculator & Search routes
router.post("/calculator", calculateTotalGrants);
router.get("/search", searchGrants);
router.get("/summary", getAllGrantsSummary);

export default router;
