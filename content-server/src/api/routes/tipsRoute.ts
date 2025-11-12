import { Router } from "express";
import {
  getPublicStories,
  getPublicStoryById,
  getFeaturedStories
} from "../controllers/storyController";

const router = Router();

router.get("/stories", getPublicStories);
router.get("/featured", getFeaturedStories);
router.get("/stories/:id", getPublicStoryById);

export default router;
