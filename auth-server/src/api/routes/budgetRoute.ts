import { Router } from "express";
import {getBudgetCategories, createOrUpdateBudgetEstimate, getBudgetEstimate,
saveOrUpdateBudget, getUserBudget, getBudgetHistory, deleteBudget,} from "../controllers/profileController";
import {saveCalculatorHistory, getCalculatorHistory} from "../controllers/services/budgetCalculatorService";

const router = Router();


// Budget categories
router.get("/categories", getBudgetCategories);

// Calculator History routes
/**
 * @api {post} /budgets/calculator/history Save calculator history
 * @apiName SaveCalculatorHistory
 * @apiGroup Budgets
 */
router.post("/calculator/history", saveCalculatorHistory);
/**
 * @api {get} /budgets/calculator/history/:userId Get calculator history for user
 * @apiName GetCalculatorHistory
 * @apiGroup Budgets
 * @apiParam {String} userId User's unique ID
 */
router.get("/calculator/history/:userId", getCalculatorHistory);

//budget estimates
router.post("/estimate", createOrUpdateBudgetEstimate);
router.get("/estimate", getBudgetEstimate);

// Budget Management
/**
 * @api {post} /budgets/ Save or update budget
 * @apiName SaveOrUpdateBudget
 * @apiGroup Budgets
 */
router.post("/", saveOrUpdateBudget);
/**
 * @api {get} /budgets/:userId/history Get budget history for user
 * @apiName GetBudgetHistory
 * @apiGroup Budgets
 * @apiParam {String} userId User's unique ID
 */
router.get("/:userId/history", getBudgetHistory);
/**
 * @api {get} /budgets/:userId Get user budget
 * @apiName GetUserBudget
 * @apiGroup Budgets
 * @apiParam {String} userId User's unique ID
 */
router.get("/:userId", getUserBudget);
/**
 * @api {delete} /budgets/:budgetId Delete budget
 * @apiName DeleteBudget
 * @apiGroup Budgets
 * @apiParam {String} budgetId Budget's unique ID
 */
router.delete("/:budgetId", deleteBudget);

export default router;
