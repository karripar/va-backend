// exchangeStories.routes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, validateStory, adminMiddleware } from '../../middlewares';
import { validationResult } from 'express-validator';
import {getApprovedStoriesHandler, getAllStoriesHandler, getStoryByIdHandler, createStoryHandler,
  updateStoryHandler, deleteStoryHandler, approveStoryHandler, likeStoryHandler,
  getCountriesHandler} from '../controllers/services/ExchangeStoriesService';

const router = Router();

/**
 * @api {get} /stories Get approved stories
 */
router.get('/stories', getApprovedStoriesHandler);

/**
 * @api {get} /stories/all Get all approved stories (admin)
 */
router.get('/stories/all', getAllStoriesHandler);

/**
 * @api {get} /stories/:id Get story by ID
 */
router.get('/stories/:id', getStoryByIdHandler);

/**
 * @api {post} /stories Create a new story (Admin only)
 */
router.post(
  '/stories',
  authenticate,
  adminMiddleware,
  validateStory,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  createStoryHandler
);

/**
 * @api {put} /stories/:id Update story
 */
router.put('/stories/:id', updateStoryHandler);

/**
 * @api {delete} /stories/:id Delete a story
 */
router.delete('/stories/:id', deleteStoryHandler);

/**
 * @api {put} /stories/:id/approve Approve a story
 */
router.put('/stories/:id/approve', approveStoryHandler);

/**
 * @api {post} /stories/:id/
 */
router.post('/stories/:id/like', likeStoryHandler);

/**
 * @api {get} /countries Get countries with story counts
 */
router.get('/countries', getCountriesHandler);

export default router;
