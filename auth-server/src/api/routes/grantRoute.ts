import { Router } from "express";
import {getErasmusGrantTypes, applyForErasmusGrant, updateErasmusGrant, getUserErasmusGrants,
  applyForKelaSupport, updateKelaSupport, getKelaSupport,
  calculateTotalGrants, searchGrants, getAllGrantsSummary, getBudgetCategories,} from "../controllers/profileController";
import { authenticate } from "../../middlewares";

/**
 * @apiDefine GrantsGroup Grants
 * Grant application and management (Erasmus+, Kela, etc.)
 */

const router = Router();

router.get(
  /**
   * @api {get} /grants/budget/categories Get budget categories for grants
   * @apiName GetGrantBudgetCategories
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve budget categories relevant to grant applications
   *
   * @apiPermission None - public endpoint
   *
   * @apiSuccess (200) {Object[]} categories List of budget categories
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "id": "travel",
   *     "name": "Travel Expenses"
   *   }
   * ]
   */
  "/budget/categories",
  getBudgetCategories
);

router.get(
  /**
   * @api {get} /grants/erasmus/types Get Erasmus+ grant types
   * @apiName GetErasmusGrantTypes
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve available Erasmus+ grant types
   *
   * @apiPermission None - public endpoint
   *
   * @apiSuccess (200) {Object[]} types List of Erasmus+ grant types
   * @apiSuccess (200) {String} types.id Grant type ID
   * @apiSuccess (200) {String} types.name Grant type name
   * @apiSuccess (200) {String} types.description Description
   * @apiSuccess (200) {Number} types.amount Grant amount
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "id": "studies",
   *     "name": "Studies Grant",
   *     "description": "Grant for study mobility",
   *     "amount": 600
   *   }
   * ]
   */
  "/erasmus/types",
  getErasmusGrantTypes
);

router.post(
  /**
   * @api {post} /grants/erasmus/apply Apply for Erasmus+ grant
   * @apiName ApplyForErasmusGrant
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Submit an application for Erasmus+ grant
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiBody {String} grantType Type of Erasmus+ grant
   * @apiBody {String} destination Destination country
   * @apiBody {String} duration Duration of stay
   * @apiBody {Object} [additionalInfo] Additional application information
   *
   * @apiSuccess (201) {Object} grant Created Erasmus+ grant application
   * @apiSuccess (201) {String} grant.id Grant application ID
   * @apiSuccess (201) {String} grant.status Application status
   *
   * @apiError (400) BadRequest Missing required fields
   * @apiError (401) Unauthorized Missing or invalid authentication token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "id": "grant123",
   *   "grantType": "studies",
   *   "destination": "France",
   *   "status": "pending"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Missing required fields"
   * }
   */
  "/erasmus/apply",
  authenticate,
  applyForErasmusGrant
);

router.put(
  /**
   * @api {put} /grants/erasmus/:grantId Update Erasmus+ grant
   * @apiName UpdateErasmusGrant
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Update an existing Erasmus+ grant application
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} grantId Erasmus+ grant unique ID
   * @apiBody {Object} updates Updated grant data
   *
   * @apiSuccess (200) {Object} grant Updated grant application
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (404) NotFound Grant not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "id": "grant123",
   *   "status": "approved",
   *   "updatedAt": "2025-11-29T10:00:00.000Z"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "Grant not found"
   * }
   */
  "/erasmus/:grantId",
  authenticate,
  updateErasmusGrant
);

router.get(
  /**
   * @api {get} /grants/erasmus Get user Erasmus+ grants
   * @apiName GetUserErasmusGrants
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve all Erasmus+ grants for the authenticated user
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiSuccess (200) {Object[]} grants List of user's Erasmus+ grants
   * @apiSuccess (200) {String} grants.id Grant ID
   * @apiSuccess (200) {String} grants.grantType Grant type
   * @apiSuccess (200) {String} grants.status Application status
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "id": "grant123",
   *     "grantType": "studies",
   *     "status": "approved"
   *   }
   * ]
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 401 Unauthorized
   * {
   *   "error": "Unauthorized"
   * }
   */
  "/erasmus",
  authenticate,
  getUserErasmusGrants
);

router.post(
  /**
   * @api {post} /grants/kela/apply Apply for Kela support
   * @apiName ApplyForKelaSupport
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Submit an application for Kela study support
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiBody {String} supportType Type of Kela support
   * @apiBody {Object} financialInfo Financial information
   * @apiBody {Object} [additionalInfo] Additional information
   *
   * @apiSuccess (201) {Object} support Created Kela support application
   * @apiSuccess (201) {String} support.id Application ID
   * @apiSuccess (201) {String} support.status Application status
   *
   * @apiError (400) BadRequest Missing required fields
   * @apiError (401) Unauthorized Missing or invalid authentication token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "id": "kela123",
   *   "supportType": "study_grant",
   *   "status": "pending"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Missing required fields"
   * }
   */
  "/kela/apply",
  authenticate,
  applyForKelaSupport
);

router.put(
  /**
   * @api {put} /grants/kela/:kelaId Update Kela support
   * @apiName UpdateKelaSupport
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Update an existing Kela support application
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} kelaId Kela support unique ID
   * @apiBody {Object} updates Updated support data
   *
   * @apiSuccess (200) {Object} support Updated Kela support application
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (404) NotFound Kela support not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "id": "kela123",
   *   "status": "approved",
   *   "updatedAt": "2025-11-29T10:00:00.000Z"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "Kela support not found"
   * }
   */
  "/kela/:kelaId",
  authenticate,
  updateKelaSupport
);

router.get(
  /**
   * @api {get} /grants/kela Get Kela support
   * @apiName GetKelaSupport
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve Kela support applications for the authenticated user
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiSuccess (200) {Object[]} support List of Kela support applications
   * @apiSuccess (200) {String} support.id Support ID
   * @apiSuccess (200) {String} support.supportType Support type
   * @apiSuccess (200) {String} support.status Application status
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "id": "kela123",
   *     "supportType": "study_grant",
   *     "status": "approved"
   *   }
   * ]
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 401 Unauthorized
   * {
   *   "error": "Unauthorized"
   * }
   */
  "/kela",
  authenticate,
  getKelaSupport
);

router.post(
  /**
   * @api {post} /grants/calculator Calculate total grants
   * @apiName CalculateTotalGrants
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Calculate total available grants based on user criteria
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiBody {Object} criteria Calculation criteria
   * @apiBody {String} criteria.destination Destination country
   * @apiBody {String} criteria.duration Study duration
   * @apiBody {Object} criteria.financialInfo Financial information
   *
   * @apiSuccess (200) {Object} calculation Grant calculation results
   * @apiSuccess (200) {Number} calculation.totalErasmus Total Erasmus+ grants
   * @apiSuccess (200) {Number} calculation.totalKela Total Kela support
   * @apiSuccess (200) {Number} calculation.grandTotal Grand total
   *
   * @apiError (400) BadRequest Missing required fields
   * @apiError (401) Unauthorized Missing or invalid authentication token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "totalErasmus": 3600,
   *   "totalKela": 2500,
   *   "grandTotal": 6100
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Missing required fields"
   * }
   */
  "/calculator",
  authenticate,
  calculateTotalGrants
);

router.get(
  /**
   * @api {get} /grants/search Search grants
   * @apiName SearchGrants
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Search for available grants based on criteria
   *
   * @apiPermission None - public endpoint
   *
   * @apiQuery {String} [country] Filter by destination country
   * @apiQuery {String} [type] Filter by grant type
   * @apiQuery {Number} [minAmount] Minimum grant amount
   *
   * @apiSuccess (200) {Object[]} grants List of matching grants
   * @apiSuccess (200) {String} grants.id Grant ID
   * @apiSuccess (200) {String} grants.name Grant name
   * @apiSuccess (200) {Number} grants.amount Grant amount
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "id": "grant1",
   *     "name": "Erasmus+ Studies",
   *     "amount": 600
   *   }
   * ]
   */
  "/search",
  searchGrants
);

router.get(
  /**
   * @api {get} /grants/summary Get all grants summary
   * @apiName GetAllGrantsSummary
   * @apiGroup GrantsGroup
   * @apiVersion 1.0.0
   * @apiDescription Get a summary of all grants for the authenticated user
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiSuccess (200) {Object} summary Grant summary
   * @apiSuccess (200) {Number} summary.totalErasmus Total Erasmus+ amount
   * @apiSuccess (200) {Number} summary.totalKela Total Kela amount
   * @apiSuccess (200) {Number} summary.grandTotal Grand total
   * @apiSuccess (200) {Number} summary.pendingApplications Number of pending applications
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "totalErasmus": 3600,
   *   "totalKela": 2500,
   *   "grandTotal": 6100,
   *   "pendingApplications": 2
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 401 Unauthorized
   * {
   *   "error": "Unauthorized"
   * }
   */
  "/summary",
  authenticate,
  getAllGrantsSummary
);

export default router;
