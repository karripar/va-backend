import { Router } from "express";
import {getBudgetCategories, createOrUpdateBudgetEstimate, getBudgetEstimate,
saveOrUpdateBudget, getUserBudget, getBudgetHistory, deleteBudget,} from "../controllers/profileController";
import {saveCalculatorHistory, getCalculatorHistory} from "../controllers/services/budgetCalculatorService";
import { authenticate } from "../../middlewares";

/**
 * @apiDefine BudgetsGroup Budgets
 * Budget management, estimates, and calculator functionality
 */

const router = Router();

router.get(
  /**
   * @api {get} /budgets/categories Get budget categories
   * @apiName GetBudgetCategories
   * @apiGroup BudgetsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve all available budget categories
   *
   * @apiPermission None - public endpoint
   *
   * @apiSuccess (200) {Object[]} categories List of budget categories
   * @apiSuccess (200) {String} categories.id Category ID
   * @apiSuccess (200) {String} categories.name Category name
   * @apiSuccess (200) {String} categories.description Category description
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "id": "accommodation",
   *     "name": "Accommodation",
   *     "description": "Housing and lodging expenses"
   *   }
   * ]
   */
  "/categories",
  getBudgetCategories
);

router.post(
  /**
   * @api {post} /budgets/calculator/history Save calculator history
   * @apiName SaveCalculatorHistory
   * @apiGroup BudgetsGroup
   * @apiVersion 1.0.0
   * @apiDescription Save budget calculator calculation to history
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiBody {Object} calculation Calculator data
   * @apiBody {Object} calculation.categories Budget breakdown by category
   * @apiBody {Number} calculation.total Total budget amount
   * @apiBody {String} calculation.currency Currency code
   *
   * @apiSuccess (201) {Object} history Saved calculator history entry
   * @apiSuccess (201) {String} history.id History entry ID
   * @apiSuccess (201) {String} history.createdAt Creation timestamp
   *
   * @apiError (400) BadRequest Missing required fields
   * @apiError (401) Unauthorized Missing or invalid authentication token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "id": "calc123",
   *   "calculation": {...},
   *   "createdAt": "2025-11-29T10:00:00.000Z"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Missing required fields"
   * }
   */
  "/calculator/history",
  authenticate,
  saveCalculatorHistory
);

router.get(
  /**
   * @api {get} /budgets/calculator/history/:userId Get calculator history
   * @apiName GetCalculatorHistory
   * @apiGroup BudgetsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve budget calculator history for a user
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} userId User's unique ID
   *
   * @apiSuccess (200) {Object[]} history List of calculator history entries
   * @apiSuccess (200) {String} history.id Entry ID
   * @apiSuccess (200) {Object} history.calculation Calculation data
   * @apiSuccess (200) {String} history.createdAt Creation timestamp
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (404) NotFound User not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "id": "calc123",
   *     "calculation": { "total": 5000 },
   *     "createdAt": "2025-11-29T10:00:00.000Z"
   *   }
   * ]
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "User not found"
   * }
   */
  "/calculator/history/:userId",
  authenticate,
  getCalculatorHistory
);

router.post(
  /**
   * @api {post} /budgets/estimate Create or update budget estimate
   * @apiName CreateOrUpdateBudgetEstimate
   * @apiGroup BudgetsGroup
   * @apiVersion 1.0.0
   * @apiDescription Create or update a budget estimate for the user
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiBody {Object} estimate Budget estimate data
   * @apiBody {Number} estimate.amount Estimated budget amount
   * @apiBody {String} estimate.currency Currency code
   * @apiBody {Object} estimate.breakdown Budget breakdown by category
   *
   * @apiSuccess (201) {Object} estimate Created/updated estimate
   *
   * @apiError (400) BadRequest Missing required fields
   * @apiError (401) Unauthorized Missing or invalid authentication token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "userId": "123",
   *   "amount": 5000,
   *   "currency": "EUR",
   *   "breakdown": {...}
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Missing required fields"
   * }
   */
  "/estimate",
  authenticate,
  createOrUpdateBudgetEstimate
);

router.get(
  /**
   * @api {get} /budgets/estimate Get budget estimate
   * @apiName GetBudgetEstimate
   * @apiGroup BudgetsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve the current budget estimate for the user
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiSuccess (200) {Object} estimate Budget estimate object
   * @apiSuccess (200) {Number} estimate.amount Estimated amount
   * @apiSuccess (200) {String} estimate.currency Currency code
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (404) NotFound Estimate not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "userId": "123",
   *   "amount": 5000,
   *   "currency": "EUR"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "Estimate not found"
   * }
   */
  "/estimate",
  authenticate,
  getBudgetEstimate
);

router.post(
  /**
   * @api {post} /budgets Save or update budget
   * @apiName SaveOrUpdateBudget
   * @apiGroup BudgetsGroup
   * @apiVersion 1.0.0
   * @apiDescription Save or update a budget record
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiBody {Object} budget Budget data
   * @apiBody {String} budget.period Budget period (monthly/semester/year)
   * @apiBody {Object} budget.categories Category breakdown
   * @apiBody {Number} budget.total Total budget amount
   *
   * @apiSuccess (201) {Object} budget Created/updated budget
   *
   * @apiError (400) BadRequest Missing required fields
   * @apiError (401) Unauthorized Missing or invalid authentication token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "id": "budget123",
   *   "userId": "123",
   *   "period": "semester",
   *   "total": 5000
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Missing required fields"
   * }
   */
  "/",
  authenticate,
  saveOrUpdateBudget
);

router.get(
  /**
   * @api {get} /budgets/:userId/history Get budget history
   * @apiName GetBudgetHistory
   * @apiGroup BudgetsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve budget history for a user
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} userId User's unique ID
   *
   * @apiSuccess (200) {Object[]} budgets List of budget records
   * @apiSuccess (200) {String} budgets.id Budget ID
   * @apiSuccess (200) {String} budgets.period Budget period
   * @apiSuccess (200) {Number} budgets.total Total amount
   * @apiSuccess (200) {String} budgets.createdAt Creation timestamp
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (404) NotFound User not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "id": "budget123",
   *     "period": "semester",
   *     "total": 5000,
   *     "createdAt": "2025-11-29T10:00:00.000Z"
   *   }
   * ]
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "User not found"
   * }
   */
  "/:userId/history",
  authenticate,
  getBudgetHistory
);

router.get(
  /**
   * @api {get} /budgets/:userId Get user budget
   * @apiName GetUserBudget
   * @apiGroup BudgetsGroup
   * @apiVersion 1.0.0
   * @apiDescription Get the current budget for a specific user
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} userId User's unique ID
   *
   * @apiSuccess (200) {Object} budget User's current budget
   * @apiSuccess (200) {String} budget.id Budget ID
   * @apiSuccess (200) {Object} budget.categories Category breakdown
   * @apiSuccess (200) {Number} budget.total Total amount
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (404) NotFound Budget not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "id": "budget123",
   *   "userId": "123",
   *   "categories": {...},
   *   "total": 5000
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "Budget not found"
   * }
   */
  "/:userId",
  authenticate,
  getUserBudget
);

router.delete(
  /**
   * @api {delete} /budgets/:budgetId Delete budget
   * @apiName DeleteBudget
   * @apiGroup BudgetsGroup
   * @apiVersion 1.0.0
   * @apiDescription Delete a budget record
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} budgetId Budget's unique ID
   *
   * @apiSuccess (200) {String} message Success message
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (404) NotFound Budget not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "message": "Budget deleted successfully"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "Budget not found"
   * }
   */
  "/:budgetId",
  authenticate,
  deleteBudget
);



export default router;
