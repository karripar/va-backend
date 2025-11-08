import { Router } from "express";
import {
  getProfilePage,
  updateProfile,
  createProfile,
  addFavorite,
  getProfile,
  removeFavorite,
  addDocument,
  removeDocument,
} from "../controllers/profileController";
// import {authenticate} from '../middlewares/authentication'; 

const router = Router();

router.post("/", createProfile);
router.get("/:id", getProfilePage);
router.get("/", getProfile);
router.put("/:id", updateProfile);


router.post("/favorites", addFavorite);
router.delete("/favorites", removeFavorite);


router.post("/documents", addDocument);
router.delete("/documents/:docId", removeDocument);

export default router;
