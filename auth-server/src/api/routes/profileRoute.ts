import { Router } from "express";
import { addFavorite, removeFavorite, addDocument, removeDocument, updateProfile } from "../controllers/profileController";
import { authenticate } from "../../middlewares";

/**
 * @apiDefine ProfileGroup Profile
 * User profile management, favorites, and documents
 */

const router = Router();

router.post(
  /**
   * @api {post} /profile/favorites Add favorite
   * @apiName AddFavorite
   * @apiGroup ProfileGroup
   * @apiVersion 1.0.0
   * @apiDescription Add an item to user's favorites
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiBody {String} itemId ID of the item to favorite
   * @apiBody {String} itemType Type of item (story, grant, etc.)
   *
   * @apiSuccess (200) {Object} favorite Added favorite object
   * @apiSuccess (200) {String} favorite.itemId Item ID
   * @apiSuccess (200) {String} favorite.itemType Item type
   * @apiSuccess (200) {String} favorite.addedAt Timestamp when added
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (400) BadRequest Missing required fields
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "itemId": "story123",
   *   "itemType": "story",
   *   "addedAt": "2025-11-29T10:00:00.000Z"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 401 Unauthorized
   * {
   *   "error": "Unauthorized"
   * }
   *
   * @apiErrorExample {json} BadRequest-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Missing required fields"
   * }
   */
  "/favorites",
  authenticate,
  addFavorite
);

router.delete(
  /**
   * @api {delete} /profile/favorites Remove favorite
   * @apiName RemoveFavorite
   * @apiGroup ProfileGroup
   * @apiVersion 1.0.0
   * @apiDescription Remove an item from user's favorites
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiBody {String} itemId ID of the item to unfavorite
   * @apiBody {String} itemType Type of item
   *
   * @apiSuccess (200) {String} message Success message
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (404) NotFound Favorite not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "message": "Favorite removed successfully"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "Favorite not found"
   * }
   */
  "/favorites",
  authenticate,
  removeFavorite
);

router.post(
  /**
   * @api {post} /profile/documents Add document
   * @apiName AddDocument
   * @apiGroup ProfileGroup
   * @apiVersion 1.0.0
   * @apiDescription Add a document to user's profile
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiBody {String} name Document name
   * @apiBody {String} type Document type
   * @apiBody {String} url Document URL
   * @apiBody {String} [description] Optional description
   *
   * @apiSuccess (201) {Object} document Created document object
   * @apiSuccess (201) {String} document.id Document ID
   * @apiSuccess (201) {String} document.name Document name
   * @apiSuccess (201) {String} document.url Document URL
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (400) BadRequest Missing required fields
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "id": "doc123",
   *   "name": "Passport",
   *   "type": "identification",
   *   "url": "https://..."
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Missing required fields"
   * }
   */
  "/documents",
  authenticate,
  addDocument
);

router.delete(
  /**
   * @api {delete} /profile/documents/:docId Remove document
   * @apiName RemoveDocument
   * @apiGroup ProfileGroup
   * @apiVersion 1.0.0
   * @apiDescription Remove a document from user's profile
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} docId Document's unique ID
   *
   * @apiSuccess (200) {String} message Success message
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (404) NotFound Document not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "message": "Document removed successfully"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "Document not found"
   * }
   */
  "/documents/:docId",
  authenticate,
  removeDocument
);

router.put(
  /**
   * @api {put} /profile/:id Update user profile
   * @apiName UpdateProfile
   * @apiGroup ProfileGroup
   * @apiVersion 1.0.0
   * @apiDescription Update user profile information
   *
   * @apiPermission Authenticated user JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} id User's unique ID
   * @apiBody {Object} profile Updated profile data
   * @apiBody {String} [profile.userName] User display name
   * @apiBody {String} [profile.email] Email address
   * @apiBody {String} [profile.bio] User biography
   * @apiBody {Object} [profile.preferences] User preferences
   *
   * @apiSuccess (200) {Object} user Updated user object
   * @apiSuccess (200) {String} user.id User ID
   * @apiSuccess (200) {String} user.userName User name
   * @apiSuccess (200) {String} user.email Email address
   *
   * @apiError (401) Unauthorized Missing or invalid authentication token
   * @apiError (403) Forbidden Cannot update another user's profile
   * @apiError (404) NotFound User not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "id": "123",
   *   "userName": "John Doe",
   *   "email": "john@example.com",
   *   "bio": "Exchange student"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 403 Forbidden
   * {
   *   "error": "Cannot update another user's profile"
   * }
   *
   * @apiErrorExample {json} NotFound-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "User not found"
   * }
   */
  "/:id",
  authenticate,
  updateProfile
);

export default router;
