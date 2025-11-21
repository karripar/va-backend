import { Request, Response, NextFunction } from "express";
import Profile from "../models/ProfileModel";
import { getUserFromRequest, validateRequiredFields, isValidEmail } from "../../utils/authHelpers";

export const createProfile = async (req: Request, res: Response) => {
  try {
    const missing = validateRequiredFields(req.body, ['userId', 'userName', 'email']);
    if (missing.length > 0) {
      return res.status(400).json({ error: 'Missing required fields', missingFields: missing });
    }

    const newProfile = await Profile.create({
      userId: req.body.userId,
      // userName: req.body.userName, // Removed from ProfileModel
      // email: req.body.email, // Removed from ProfileModel
      // avatarUrl: req.body.avatarUrl ?? "", // Removed from ProfileModel
      // linkedinUrl: req.body.linkedinUrl ?? "", // Removed from ProfileModel
    });

    res.status(201).json(newProfile);
  } catch {
    res.status(500).json({ error: 'Failed to create profile' });
  }
};

export const getProfilePage = async (req: Request, res: Response) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.id });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);

    const profile = await Profile.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          // userName: `User ${userId}`, // Removed from ProfileModel
          // email: `user${userId}@example.com`, // Removed from ProfileModel
          // avatarUrl: "", // Removed from ProfileModel
          // favorites: [], // Removed from ProfileModel
          documents: [],
          // exchangeBadge: false, // Removed from ProfileModel
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (req.body.email && !isValidEmail(req.body.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.params.id },
      req.body,
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const addFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination } = req.body;

    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // if (!profile.favorites.includes(destination)) {
    //   profile.favorites.push(destination);
    //   await profile.save();
    // }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination } = req.body;

    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // profile.favorites = profile.favorites.filter((fav: string) => fav !== destination);
    // await profile.save();

    res.json(profile);
  } catch (error) {
    next(error);
  }
};
