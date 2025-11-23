import { Router } from "express";
import {getStories, getStoryById, createStory, updateStory, reactToStory, getFeaturedStories} from "../controllers/services/storyService";

const router = Router();

router.get("/stories", getStories);
router.get("/featured", getFeaturedStories);
router.get("/stories/:id", getStoryById);
router.post("/stories", createStory);
router.put("/stories/:id", updateStory);
router.post("/stories/:id/react", reactToStory);

export default router;
