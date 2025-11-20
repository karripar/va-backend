import { Router } from "express";
import {getProfilePage, updateProfile, createProfile, getProfile, addFavorite, removeFavorite, addDocument, removeDocument,} from "../controllers/profileController";

const router = Router();

// Profile CRUD
router.get("/", getProfile);
router.post("/", createProfile);

// Favorites
router.post("/favorites", addFavorite);
router.delete("/favorites", removeFavorite);

// Document, link-based
router.post("/documents", addDocument);
router.delete("/documents/:docId", removeDocument);

// Parameterized routes
router.get("/:id", getProfilePage);
router.put("/:id", updateProfile);

export default router;
