import { Router } from "express";
import { addFavorite, removeFavorite, addDocument, removeDocument, updateProfile } from "../controllers/profileController";
import { authenticate } from "../../middlewares";

const router = Router();

// Favorites
router.post("/favorites", authenticate, addFavorite);
router.delete("/favorites", authenticate, removeFavorite);

// Documents
router.post("/documents", authenticate, addDocument);
/**
 * @api {delete} /profile/documents/:docId Remove document
 * @apiName RemoveDocument
 * @apiGroup Profile
 * @apiParam {String} docId Document's unique ID
 */
router.delete("/documents/:docId", authenticate, removeDocument);

router.put("/:id", authenticate, updateProfile);
/**
 * @api {put} /profile/:id Update user profile
 * @apiName UpdateProfile
 * @apiGroup Profile
 * @apiParam {String} id User's unique ID
 */
router.put("/:id", authenticate, updateProfile);

export default router;
