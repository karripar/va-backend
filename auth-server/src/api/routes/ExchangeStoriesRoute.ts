import { Router } from 'express';
import {getStoryById, getApprovedStories, createStory, updateStory, deleteStory, approveStory,
likeStory, getCountriesWithCounts} from '../controllers/ExchangeStoriesController';
import { authenticate, validateStory, adminMiddleware } from "../../middlewares"
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

const router = Router();

//  GET /stories
router.get('/stories', async (req, res) => {
  try {
    const filters = req.query; // To be validated  later
    const stories = await getApprovedStories(filters);
    res.json(stories);
  } catch (error) {
  console.error(error); // Log for debugging
  res.status(500).json({ error: (error as Error).message || 'Failed to fetch stories' });
}
});

router.get('/stories/all', async (req, res) => {
  try {
    const filters = req.query;
    const stories = await getApprovedStories(filters);
    res.json(stories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as Error).message || 'Failed to fetch stories' });
  }
});

// GET /stories/:id
router.get('/stories/:id', async (req, res) => {
  try {
    const story = await getStoryById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
  } catch (error) {
  console.error(error); // Log for debugging
  res.status(500).json({ error: (error as Error).message || 'Failed to fetch stories' });
}
});

// POST /stories, Admin only
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
  /* eslint-disable @typescript-eslint/no-unused-vars */
  async (req: Request, res: Response, next: NextFunction) => {
    try {
    const newStory = await createStory(req.body, 'adminId'); // Replacing with the actual admin ID
    res.status(201).json(newStory);
  } catch (error) {
  console.error(error); // Log for debugging
  res.status(500).json({ error: (error as Error).message || 'Failed to fetch stories' });
}
  }
);

// PUT /stories/:id
router.put('/stories/:id', async (req, res) => {
  try {
    const updated = await updateStory(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
  console.error(error); // Log for debugging
  res.status(500).json({ error: (error as Error).message || 'Failed to fetch stories' });
}
});

// DELETE /stories/:id
router.delete('/stories/:id', async (req, res) => {
  try {
    const deleted = await deleteStory(req.params.id);
    res.json(deleted);
  } catch (error) {
  console.error(error); // Log for debugging
  res.status(500).json({ error: (error as Error).message || 'Failed to fetch stories' });
}
});

// PUT /stories/:id/approve
router.put('/stories/:id/approve', async (req, res) => {
  try {
    const approved = await approveStory(req.params.id);
    res.json(approved);
  } catch (error) {
  console.error(error); // Log for debugging
  res.status(500).json({ error: (error as Error).message || 'Failed to fetch stories' });
}
});

// POST /stories/:id/like
router.post('/stories/:id/like', async (req, res) => {
  try {
    const likes = await likeStory(req.params.id);
    res.json({ likes });
  } catch (error) {
  console.error(error); // Log for debugging
  res.status(500).json({ error: (error as Error).message || 'Failed to fetch stories' });
}
});

// GET /countries
router.get('/countries', async (req, res) => {
  try {
    const countries = await getCountriesWithCounts();
    res.json(countries);
  } catch (error) {
  console.error(error); // Log for debugging
  res.status(500).json({ error: (error as Error).message || 'Failed to fetch stories' });
}
});

export default router;
