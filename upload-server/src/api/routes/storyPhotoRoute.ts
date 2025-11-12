import express from "express";
import { uploadStoryPhoto, deleteStoryPhoto } from "../controllers/storyPhotoController";

const router = express.Router();

/**
 * @route POST /api/v1/upload/story-photo
 * @desc Upload a story photo (cover or gallery)
 */
router.post("/story-photo", uploadStoryPhoto);

/**
 * @route DELETE /api/v1/upload/story-photo
 * @desc Delete a story photo
 */
router.delete("/story-photo", deleteStoryPhoto);

export default router;
