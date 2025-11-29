import { Router} from 'express';
import { authenticate, validateStory, adminMiddleware, validationErrors, requireAuthOrAdmin} from '../../middlewares';
import {createStoryHandler,
  getApprovedStoriesHandler,
  getStoryByIdHandler,
  updateStoryHandler,
  deleteStoryHandler,
  approveStoryHandler,
  reactStoryHandler,
  getCountriesHandler,} from '../controllers/ExchangeStoriesController';

/**
 * @apiDefine ExchangeStoriesGroup Exchange Stories
 * Exchange student stories management and interaction
 */

const router = Router();

router.get(
  /**
   * @api {get} /stories/countries Get countries with story counts
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
   * @api {get} /stories Get approved stories
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

router.get(
  /**
   * @api {get} /stories/:id Get story by ID
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

router.post(
  /**
   * @api {post} /stories Create a new story
   * @apiName CreateStory
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Create a new exchange story (authenticated users or admin)
   * @apiPermission authenticated
   *
   * @apiHeader {String} Authorization Bearer JWT token
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
  requireAuthOrAdmin,
  validateStory,
  validationErrors,
  createStoryHandler
);

router.put(
  /**
   * @api {put} /stories/:id Update story
   * @apiName UpdateStory
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Update an existing story (owner or admin only)
   * @apiPermission authenticated
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
  requireAuthOrAdmin,
  updateStoryHandler
);

router.delete(
  /**
   * @api {delete} /stories/:id Delete story
   * @apiName DeleteStory
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Delete a story (owner or admin only)
   * @apiPermission authenticated
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} id Story's unique ID
   *
   * @apiSuccess (200) {String} message Success message
   *
   * @apiError (401) {String} error Unauthorized
   * @apiError (403) {String} error Forbidden - not story owner
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
  requireAuthOrAdmin,
  deleteStoryHandler
);

router.put(
  /**
   * @api {put} /stories/:id/approve Approve story
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

router.post(
  /**
   * @api {post} /stories/:id/react React to story
   * @apiName ReactStory
   * @apiGroup ExchangeStoriesGroup
   * @apiVersion 1.0.0
   * @apiDescription Like or save a story (authenticated users)
   * @apiPermission authenticated
   *
   * @apiHeader {String} Authorization Bearer JWT token
   *
   * @apiParam {String} id Story's unique ID
   * @apiBody {String} reactionType Reaction type: 'like' or 'save'
   *
   * @apiSuccess (200) {Object} reaction Updated reaction status
   * @apiSuccess (200) {Boolean} reaction.liked Whether user liked the story
   * @apiSuccess (200) {Boolean} reaction.saved Whether user saved the story
   * @apiSuccess (200) {Number} reaction.totalLikes Total likes count
   * @apiSuccess (200) {Number} reaction.totalSaves Total saves count
   *
   * @apiError (400) {String} error Invalid reaction type
   * @apiError (401) {String} error Unauthorized
   * @apiError (404) {String} error Story not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "liked": true,
   *   "saved": false,
   *   "totalLikes": 26,
   *   "totalSaves": 10
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Invalid reaction type. Use 'like' or 'save'"
   * }
   */
  "/:id/react",
  authenticate,
  reactStoryHandler
);

export default router;
