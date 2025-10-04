import { Router } from "express";
import {getProfilePage, updateProfile, createProfile, getAllProfiles } from "../controllers/profileController";

const router = Router();

router.get("/", getAllProfiles); // GET /api/v1/profile - Get all profiles
router.post("/", createProfile); // POST /api/v1/profile
router.get("/:id", getProfilePage); // GET /api/v1/profile/:id
router.put("/:id", updateProfile); // PUT /api/v1/profile/:id

export default router;
