import { Router } from "express";
import {getStories, getStoryById, createStory, updateStory, reactToStory, getFeaturedStories} from "../controllers/services/storyService";

const router = Router();

router.get("/stories", getStories);
router.get("/featured", getFeaturedStories);
/**
 * @api {get} /tips/stories/:id Get story by ID
 * @apiName GetStoryById
 * @apiGroup Tips
 * @apiParam {String} id Story's unique ID
 */
router.get("/stories/:id", getStoryById);
router.post("/stories", createStory);
/**
 * @api {put} /tips/stories/:id Update story
 * @apiName UpdateStory
 * @apiGroup Tips
 * @apiParam {String} id Story's unique ID
 */
router.put("/stories/:id", updateStory);
/**
 * @api {post} /tips/stories/:id/react React to story
 * @apiName ReactToStory
 * @apiGroup Tips
 * @apiParam {String} id Story's unique ID
 */
router.post("/stories/:id/react", reactToStory);

export default router;
