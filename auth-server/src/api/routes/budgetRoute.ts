import { Router } from "express";
import {getBudgetCategories, createOrUpdateBudgetEstimate, getBudgetEstimate,
saveOrUpdateBudget, getUserBudget, getBudgetHistory, deleteBudget,} from "../controllers/profileController";
import {saveCalculatorHistory, getCalculatorHistory} from "../services/budgetCalculatorService";

const router = Router();

// Budget categories
router.get("/categories", getBudgetCategories);

// Calculator History routes
router.post("/calculator/history", saveCalculatorHistory);
router.get("/calculator/history/:userId", getCalculatorHistory);

//budget estimates
router.post("/estimate", createOrUpdateBudgetEstimate);
router.get("/estimate", getBudgetEstimate);

// Budget Management
router.post("/", saveOrUpdateBudget);
router.get("/:userId/history", getBudgetHistory);
router.get("/:userId", getUserBudget);
router.delete("/:budgetId", deleteBudget);

export default router;
