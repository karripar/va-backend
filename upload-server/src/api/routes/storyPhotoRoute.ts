import express from "express";
import { uploadStoryPhoto, deleteStoryPhoto } from "../controllers/storyPhotoController";

/**
 * @apiDefine StoryPhotoGroup Story Photos
 * Upload and manage story photos (cover and gallery images)
 */

const router = express.Router();

router.post(
  /**
   * @api {post} /upload/story-photo Upload story photo
   * @apiName UploadStoryPhoto
   * @apiGroup StoryPhotoGroup
   * @apiVersion 1.0.0
   * @apiDescription Upload a story photo (cover or gallery image)
   * @apiPermission authenticated
   *
   * @apiBody {File} file Image file to upload (form-data)
   * @apiBody {String} [type] Photo type: 'cover' or 'gallery'
   *
   * @apiSuccess (201) {Object} photo Uploaded photo object
   * @apiSuccess (201) {String} photo.filename Filename of the uploaded photo
   * @apiSuccess (201) {String} photo.url Public URL of the photo
   * @apiSuccess (201) {String} photo.type Photo type (cover/gallery)
   * @apiSuccess (201) {String} message Success message
   *
   * @apiError (400) {String} error No valid image file provided
   * @apiError (401) {String} error User not authenticated
   * @apiError (413) {String} error File size exceeds limit
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "photo": {
   *     "filename": "cover_1732876800000.jpg",
   *     "url": "https://example.com/uploads/cover_1732876800000.jpg",
   *     "type": "cover"
   *   },
   *   "message": "Story photo uploaded successfully"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "No valid image file provided"
   * }
   */
  "/story-photo",
  uploadStoryPhoto
);

router.delete(
  /**
   * @api {delete} /upload/story-photo Delete story photo
   * @apiName DeleteStoryPhoto
   * @apiGroup StoryPhotoGroup
   * @apiVersion 1.0.0
   * @apiDescription Delete a story photo by filename
   * @apiPermission authenticated
   *
   * @apiBody {String} filename Filename of the photo to delete
   *
   * @apiSuccess (200) {String} message Success message
   *
   * @apiError (400) {String} error No filename provided
   * @apiError (401) {String} error User not authenticated
   * @apiError (404) {String} error Photo not found
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "message": "Story photo deleted successfully"
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "No filename provided"
   * }
   */
  "/story-photo",
  deleteStoryPhoto
);

export default router;
