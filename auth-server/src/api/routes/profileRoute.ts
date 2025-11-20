import { Router } from "express";
import { addFavorite, removeFavorite, addDocument, removeDocument, updateProfile } from "../controllers/profileController";
import { authenticate } from "../../middlewares";

const router = Router();

// Favorites
router.post("/favorites", authenticate, addFavorite);
router.delete("/favorites", authenticate, removeFavorite);

// Documents
router.post("/documents", authenticate, addDocument);
router.delete("/documents/:docId", authenticate, removeDocument);

router.put("/:id", authenticate, updateProfile);

export default router;
