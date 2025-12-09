import { Router} from 'express';
import { authenticate, validateStory, adminMiddleware, validationErrors} from '../../middlewares';
import {createStoryHandler,
  getApprovedStoriesHandler,
  getAllStoriesHandler,
  getStoryByIdHandler,
  updateStoryHandler,
  deleteStoryHandler,
  approveStoryHandler,
  getCountriesHandler,} from '../controllers/ExchangeStoriesController';

/**
 * @apiDefine ExchangeStoriesGroup Exchange Stories
 * Exchange student stories management and interaction
 *
 * AUTHORIZATION MODEL:
 * - Normal Users ( logged in or user_level_id = 1): Read-only access to approved stories only
 * - Admin Users (user_level_id = 2 or 3): Full CRUD access - can create, view all stories (including unapproved), edit/delete any story, approve stories
 */

const router = Router();

router.get(
  /**
   * @api {get} /exchange-stories/countries Get countries with story counts
   * @apiName GetCountries
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve list of countries with the number of stories from each
   * @apiPermission none
   *
   * @apiSuccess (200) {Object[]} countries List of countries
   * @apiSuccess (200) {String} countries.name Country name
   * @apiSuccess (200) {String} countries.code Country code
   * @apiSuccess (200) {Number} countries.storyCount Number of stories
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "name": "France",
   *     "code": "FR",
   *     "storyCount": 15
   *   }
   * ]
   */
  "/countries",
  getCountriesHandler
);

router.get(
  /**
   * @api {get} /exhange-stories/all Get all stories (admin only)
   * @apiName GetAllStories
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve ALL stories including pending/unapproved ones (admin only)
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization Bearer JWT token (admin)
   *
   * @apiQuery {String} [country] Filter by country
   * @apiQuery {String} [university] Filter by university
   * @apiQuery {Number} [limit] Limit number of results
   * @apiQuery {Number} [skip] Skip number of results for pagination
   *
   * @apiSuccess (200) {Object[]} stories List of all stories
   * @apiSuccess (200) {Object} total Total count
   * @apiSuccess (200) {Boolean} hasMore Whether more results exist
   *
   * @apiError (401) {String} error Unauthorized
   * @apiError (403) {String} error Forbidden - admin only
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "stories": [...],
   *   "total": 50,
   *   "hasMore": true
   * }
   */
  "/all",
  authenticate,
  adminMiddleware,
  getAllStoriesHandler
);

router.get(
  /**
   * @api {get} /exhange-stories Get approved stories
   * @apiName GetApprovedStories
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve all approved exchange stories (public access)
   * @apiPermission none
   *
   * @apiQuery {String} [country] Filter by country
   * @apiQuery {String} [university] Filter by university
   * @apiQuery {Number} [limit] Limit number of results
   * @apiQuery {Number} [skip] Skip number of results for pagination
   *
   * @apiSuccess (200) {Object[]} stories List of approved stories
   * @apiSuccess (200) {String} stories.id Story ID
   * @apiSuccess (200) {String} stories.title Story title
   * @apiSuccess (200) {String} stories.content Story content
   * @apiSuccess (200) {String} stories.country Destination country
   * @apiSuccess (200) {String} stories.author Author information
   * @apiSuccess (200) {String} stories.createdAt Creation timestamp
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * [
   *   {
   *     "id": "story123",
   *     "title": "My Exchange in Paris",
   *     "content": "Amazing experience...",
   *     "country": "France",
   *     "author": "John Doe",
   *     "createdAt": "2025-11-29T10:00:00.000Z"
   *   }
   * ]
   */
  "/",
  getApprovedStoriesHandler
);

router.post(
  /**
   * @api {post} /exhange-stories Create a new story
   * @apiName CreateStory
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Create a new exchange story (admin only)
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization Bearer JWT token (admin)
   *
   * @apiBody {String} title Story title
   * @apiBody {String} content Story content
   * @apiBody {String} country Destination country
   * @apiBody {String} university Host university
   * @apiBody {String} [coverPhoto] Cover photo URL
   * @apiBody {Object[]} [photos] Gallery photos
   * @apiBody {Object} [metadata] Additional metadata
   *
   * @apiSuccess (201) {Object} story Created story object
   * @apiSuccess (201) {String} story.id Story ID
   * @apiSuccess (201) {String} story.status Story status (pending/approved)
   *
   * @apiError (400) {Object} errors Validation errors
   * @apiError (401) {String} error Unauthorized
   * @apiError (403) {String} error Forbidden - admin only
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "id": "story123",
   *   "title": "My Exchange in Paris",
   *   "status": "pending",
   *   "createdAt": "2025-11-29T10:00:00.000Z"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "errors": [
   *     { "field": "title", "message": "Title is required" }
   *   ]
   * }
   */
  "/",
  authenticate,
  adminMiddleware,
  validateStory,
  validationErrors,
  createStoryHandler
);

router.put(
  /**
   * @api {put} /exhange-stories/:id/approve Approve story
   * @apiName ApproveStory
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Approve a pending story (admin only)
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization Bearer JWT token (admin)
   *
   * @apiParam {String} id Story's unique ID
   * @apiBody {String} [reviewNotes] Optional review notes
   *
   * @apiSuccess (200) {Object} story Approved story object
   * @apiSuccess (200) {String} story.status Updated status (approved)
   *
   * @apiError (401) {String} error Unauthorized
   * @apiError (403) {String} error Forbidden - admin only
   * @apiError (404) {String} error Story not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "id": "story123",
   *   "status": "approved",
   *   "approvedAt": "2025-11-29T10:00:00.000Z"
   * }
   */
  "/:id/approve",
  authenticate,
  adminMiddleware,
  approveStoryHandler
);

router.put(
  /**
   * @api {put} /exhange-stories/:id Update story
   * @apiName UpdateStory
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Update an existing story (admin only)
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} id Story's unique ID
   * @apiBody {Object} updates Updated story fields
   *
   * @apiSuccess (200) {Object} story Updated story object
   *
   * @apiError (401) {String} error Unauthorized
   * @apiError (403) {String} error Forbidden - not story owner
   * @apiError (404) {String} error Story not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "id": "story123",
   *   "title": "Updated Title",
   *   "updatedAt": "2025-11-29T10:00:00.000Z"
   * }
   */
  "/:id",
  authenticate,
  adminMiddleware,
  updateStoryHandler
);

router.delete(
  /**
   * @api {delete} /exhange-stories/:id Delete story
   * @apiName DeleteStory
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Delete a story admins only
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization Bearer JWT token, admin
   *
   * @apiParam {String} id Story's unique ID
   *
   * @apiSuccess (200) {String} message Success message
   *
   * @apiError (401) {String} error Unauthorized
   * @apiError (403) {String} error Forbidden, admin only
   * @apiError (404) {String} error Story not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "message": "Story deleted successfully"
   * }
   */
  "/:id",
  authenticate,
  adminMiddleware,
  deleteStoryHandler
);

router.get(
  /**
   * @api {get} /exhange-stories/:id Get story by ID
   * @apiName GetStoryById
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Retrieve a specific story by its ID
   * @apiPermission none
   *
   * @apiParam {String} id Story's unique ID
   *
   * @apiSuccess (200) {Object} story Story object
   * @apiSuccess (200) {String} story.id Story ID
   * @apiSuccess (200) {String} story.title Story title
   * @apiSuccess (200) {String} story.content Full story content
   * @apiSuccess (200) {Object} story.author Author details
   * @apiSuccess (200) {Object[]} story.photos Story photos
   * @apiSuccess (200) {Object} story.reactions Likes and saves count
   *
   * @apiError (404) {String} error Story not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "id": "story123",
   *   "title": "My Exchange in Paris",
   *   "content": "Full story content...",
   *   "author": { "name": "John Doe" },
   *   "photos": [...],
   *   "reactions": { "likes": 25, "saves": 10 }
   * }
   */
  "/:id",
  getStoryByIdHandler
);

export default router;
