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
 */

/**
 * @apiDefine token
 * @apiHeader {String} Authorization Bearer JWT token
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

/**
 * @apiDefine admin
 * @apiHeader {String} Authorization Bearer JWT token (admin)
 * @apiHeaderExample {String} Authorization Header Example
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

/**
 * @apiDefine unauthorized
 * @apiError (401) {String} Unauthorized Missing or invalid authentication token
 * @apiErrorExample {json} Unauthorized:
 * {
 *  "message": "Unauthorized"
 * }
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
   * @apiUse admin
   *
   * @apiQuery {String} [country] Filter by country
   * @apiQuery {String} [university] Filter by university
   * @apiQuery {Number} [limit] Limit number of results
   * @apiQuery {Number} [offset] Offset for pagination
   *
   * @apiSuccess (200) {Object[]} stories List of all stories
   * @apiSuccess (200) {String} stories.id Story ID
   * @apiSuccess (200) {String} stories.title Story title
   * @apiSuccess (200) {String} stories.content Story content
   * @apiSuccess (200) {String} stories.city City
   * @apiSuccess (200) {String} stories.university University name
   * @apiSuccess (200) {String} stories.country Country
   * @apiSuccess (200) {Boolean} stories.isApproved Approval status
   * @apiSuccess (200) {Boolean} stories.featured Featured status
   * @apiSuccess (200) {Number} total Total count
   * @apiSuccess (200) {Boolean} hasMore Whether more results exist
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "stories": [...],
   *  "total": 50,
   *  "hasMore": true
   * }
   *
   * @apiUse unauthorized
   *
   * @apiError (403) {String} Forbidden Admin only
   * @apiErrorExample {json} Forbidden:
   * {
   *  "message": "Forbidden - admin only"
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
   * @apiQuery {Number} [limit] Limit number of results (default: 12)
   * @apiQuery {Number} [offset] Offset for pagination
   *
   * @apiSuccess (200) {Object[]} stories List of approved stories
   * @apiSuccess (200) {String} stories.id Story ID
   * @apiSuccess (200) {String} stories.title Story title
   * @apiSuccess (200) {String} stories.content Story content
   * @apiSuccess (200) {String} stories.city City
   * @apiSuccess (200) {String} stories.university University name
   * @apiSuccess (200) {String} stories.country Destination country
   * @apiSuccess (200) {String} [stories.highlights] Highlights
   * @apiSuccess (200) {String} [stories.challenges] Challenges
   * @apiSuccess (200) {String} [stories.tips] Tips
   * @apiSuccess (200) {String} stories.createdAt Creation timestamp
   * @apiSuccess (200) {Number} total Total count of approved stories
   * @apiSuccess (200) {Boolean} hasMore Whether more results exist
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "stories": [
   *    {
   *      "id": "story123",
   *      "title": "My Exchange in Paris",
   *      "content": "Amazing experience...",
   *      "city": "Paris",
   *      "university": "Sorbonne",
   *      "country": "France",
   *      "createdAt": "2025-11-29T10:00:00.000Z"
   *    }
   *  ],
   *  "total": 25,
   *  "hasMore": true
   * }
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
   * @apiUse admin
   *
   * @apiBody {String} title Story title (required)
   * @apiBody {String} content Story content (required)
   * @apiBody {String} city City (required)
   * @apiBody {String} university Host university (required)
   * @apiBody {String} country Destination country (required)
   * @apiBody {String} [highlights] Story highlights
   * @apiBody {String} [challenges] Challenges faced
   * @apiBody {String} [tips] Tips for future students
   *
   * @apiSuccess (201) {Object} story Created story object
   * @apiSuccess (201) {String} story.id Story ID
   * @apiSuccess (201) {String} story.title Story title
   * @apiSuccess (201) {String} story.content Story content
   * @apiSuccess (201) {String} story.city City
   * @apiSuccess (201) {String} story.university University
   * @apiSuccess (201) {String} story.country Country
   * @apiSuccess (201) {Boolean} story.isApproved Approval status (false by default)
   * @apiSuccess (201) {Boolean} story.featured Featured status
   * @apiSuccess (201) {String} story.createdBy User ID who created the story
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *  "story": {
   *    "id": "story123",
   *    "title": "My Exchange in Paris",
   *    "content": "Amazing experience...",
   *    "city": "Paris",
   *    "university": "Sorbonne",
   *    "country": "France",
   *    "isApproved": false,
   *    "featured": false,
   *    "createdBy": "user123",
   *    "createdAt": "2025-11-29T10:00:00.000Z"
   *  }
   * }
   *
   * @apiError (400) {String} BadRequest Validation errors
   * @apiErrorExample {json} BadRequest:
   * {
   *  "message": "Title is required"
   * }
   *
   * @apiUse unauthorized
   *
   * @apiError (403) {String} Forbidden Admin only
   * @apiErrorExample {json} Forbidden:
   * {
   *  "message": "Forbidden - admin only"
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
   * @apiUse admin
   *
   * @apiParam {String} id Story's unique ID
   *
   * @apiSuccess (200) {Object} story Approved story object
   * @apiSuccess (200) {Boolean} story.isApproved Updated approval status (true)
   * @apiSuccess (200) {String} story.id Story ID
   * @apiSuccess (200) {String} story.title Story title
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "story": {
   *    "id": "story123",
   *    "title": "My Exchange in Paris",
   *    "isApproved": true,
   *    "updatedAt": "2025-11-29T10:00:00.000Z"
   *  }
   * }
   *
   * @apiError (400) {String} BadRequest Invalid story ID
   * @apiErrorExample {json} BadRequest:
   * {
   *  "message": "Invalid story ID provided"
   * }
   *
   * @apiUse unauthorized
   *
   * @apiError (403) {String} Forbidden Admin only
   * @apiErrorExample {json} Forbidden:
   * {
   *  "message": "Forbidden - admin only"
   * }
   *
   * @apiError (404) {String} NotFound Story not found
   * @apiErrorExample {json} NotFound:
   * {
   *  "message": "Story not found"
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
   * @apiUse admin
   *
   * @apiParam {String} id Story's unique ID
   * @apiBody {String} [title] Updated story title
   * @apiBody {String} [content] Updated story content
   * @apiBody {String} [city] Updated city
   * @apiBody {String} [university] Updated university
   * @apiBody {String} [country] Updated country
   * @apiBody {String} [highlights] Updated highlights
   * @apiBody {String} [challenges] Updated challenges
   * @apiBody {String} [tips] Updated tips
   * @apiBody {Boolean} [featured] Featured status
   *
   * @apiSuccess (200) {Object} story Updated story object
   * @apiSuccess (200) {String} story.id Story ID
   * @apiSuccess (200) {String} story.title Story title
   * @apiSuccess (200) {String} story.updatedAt Update timestamp
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "story": {
   *    "id": "story123",
   *    "title": "Updated Title",
   *    "content": "Updated content...",
   *    "updatedAt": "2025-11-29T10:00:00.000Z"
   *  }
   * }
   *
   * @apiError (400) {String} BadRequest Invalid story ID
   * @apiErrorExample {json} BadRequest:
   * {
   *  "message": "Invalid story ID provided"
   * }
   *
   * @apiUse unauthorized
   *
   * @apiError (403) {String} Forbidden Admin only
   * @apiErrorExample {json} Forbidden:
   * {
   *  "message": "Forbidden - admin only"
   * }
   *
   * @apiError (404) {String} NotFound Story not found
   * @apiErrorExample {json} NotFound:
   * {
   *  "message": "Story not found"
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
   * @apiDescription Delete a story (admin only)
   * @apiPermission admin
   *
   * @apiUse admin
   *
   * @apiParam {String} id Story's unique ID
   *
   * @apiSuccess (200) {Object} story Deleted story object
   * @apiSuccess (200) {String} story.id Story ID
   * @apiSuccess (200) {String} story.title Story title
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "story": {
   *    "id": "story123",
   *    "title": "My Exchange in Paris"
   *  }
   * }
   *
   * @apiError (400) {String} BadRequest Invalid story ID
   * @apiErrorExample {json} BadRequest:
   * {
   *  "message": "Invalid story ID provided"
   * }
   *
   * @apiUse unauthorized
   *
   * @apiError (403) {String} Forbidden Admin only
   * @apiErrorExample {json} Forbidden:
   * {
   *  "message": "Forbidden - admin only"
   * }
   *
   * @apiError (404) {String} NotFound Story not found
   * @apiErrorExample {json} NotFound:
   * {
   *  "message": "Story not found"
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
   * @apiSuccess (200) {String} story.city City
   * @apiSuccess (200) {String} story.university University name
   * @apiSuccess (200) {String} story.country Country
   * @apiSuccess (200) {String} [story.highlights] Highlights
   * @apiSuccess (200) {String} [story.challenges] Challenges
   * @apiSuccess (200) {String} [story.tips] Tips
   * @apiSuccess (200) {String} story.createdBy User ID who created the story
   * @apiSuccess (200) {Boolean} story.isApproved Approval status
   * @apiSuccess (200) {Boolean} story.featured Featured status
   * @apiSuccess (200) {String} story.createdAt Creation timestamp
   * @apiSuccess (200) {String} story.updatedAt Update timestamp
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *  "story": {
   *    "id": "story123",
   *    "title": "My Exchange in Paris",
   *    "content": "Full story content...",
   *    "city": "Paris",
   *    "university": "Sorbonne",
   *    "country": "France",
   *    "highlights": "Amazing culture",
   *    "challenges": "Language barrier",
   *    "tips": "Learn basic French",
   *    "createdBy": "user123",
   *    "isApproved": true,
   *    "featured": false,
   *    "createdAt": "2025-11-29T10:00:00.000Z",
   *    "updatedAt": "2025-11-29T12:00:00.000Z"
   *  }
   * }
   *
   * @apiError (400) {String} BadRequest Invalid story ID
   * @apiErrorExample {json} BadRequest:
   * {
   *  "message": "Invalid story ID provided"
   * }
   *
   * @apiError (404) {String} NotFound Story not found
   * @apiErrorExample {json} NotFound:
   * {
   *  "message": "Story not found"
   * }
   */
  "/:id",
  getStoryByIdHandler
);

export default router;
