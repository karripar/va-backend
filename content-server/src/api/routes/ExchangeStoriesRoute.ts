import { Router} from 'express'; // Request, Response, NextFunction } from 'express';
import { authenticate, validateStory, adminMiddleware, validationErrors, requireAuthOrAdmin} from '../../middlewares';
import {createStoryHandler,
  getApprovedStoriesHandler,
  //getAllStoriesHandler,
  getStoryByIdHandler,
  updateStoryHandler,
  deleteStoryHandler,
  approveStoryHandler,
  reactStoryHandler,
  getCountriesHandler,} from '../controllers/ExchangeStoriesController';

const router = Router();

/**
 * @api {get} /stories Get approved stories
 * @apiName GetApprovedStories
 * @apiGroup ExchangeStories
 * public access
 */

router.get("/", getApprovedStoriesHandler);

/**
 * @api {get} /stories/all Get all approved stories
 * @apiName GetAllStories
 * @apiGroup ExchangeStories
 * Admin access only
 */
///router.get('/stories/all', authenticate, adminMiddleware, getAllStoriesHandler);

/**
 * @api {get} /stories/:id Get story by ID
 * @apiName GetStoryById
 * @apiGroup ExchangeStories
 * @apiParam {String} id Story ID
 */
router.get("/:id", getStoryByIdHandler);

/**
 * @api {post} /stories Create a new story (Admin only)
 */
/**
 * @api {get} /stories/:id Get story by ID
 * @apiParam {String} id Story ID
 * @apiGroup ExchangeStories
 * Creating story admin or authorized user only
 */
router.post(
  "/",
  authenticate,
  requireAuthOrAdmin,
  validateStory,
  validationErrors,
  createStoryHandler

  /*
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createStoryHandler
  */
);

/**
 * @api {put} /stories/:id Update story
 * @apiName UpdateStory
 * @apiGroup ExchangeStories
 * @apiParam {String} id Story's unique ID
 */
router.put("/:id", authenticate, requireAuthOrAdmin, updateStoryHandler);

/**
 * @api {delete} /stories/:id Delete a story
 * @apiName DeleteStory
 * @apiGroup ExchangeStories
 * @apiParam {String} id Story's unique ID
 * Admin or the owner only
 */
router.delete("/:id", authenticate, requireAuthOrAdmin, deleteStoryHandler);

/**
 * @api {put} /stories/:id/approve Approve a
 * @apiGroup ExchangeStories
 * @apiParam {String} id Story's unique ID
 * Admin only
 */
router.put("/:id", authenticate,adminMiddleware, approveStoryHandler);

/**
 * @api {post} /stories/:id/
 * @apiName LikeStory
 * @apiGroup ExchangeStories
 * @apiParam {String} id Story's unique ID
 * Public access
 */
router.post("/:id/like", deleteStoryHandler);
router.post("/:id/react", authenticate, reactStoryHandler);

/**
 * @api {get} /countries Get countries with story counts
 * @apiName GetCountries
 * @apiGroup ExchangeStories
 * Public access
 */
router.get("/", getCountriesHandler);

export default router;
