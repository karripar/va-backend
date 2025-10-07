import { Request, Response, NextFunction } from "express";
import { MessageResponse } from "../../types/MessageTypes";
import CustomError from "../../classes/CustomError";
import User from "../models/userModel";
import { ProfileResponse } from "va-hybrid-types/contentTypes";
import { v4 as uuidv4 } from "uuid";

// add a new user when the Google sign-in is used the first time
const createUser = async (googleData: {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}) => {
  try {
    const user = new User({
      id: uuidv4(),
      googleId: googleData.googleId,
      userName: googleData.name,
      email: googleData.email,
      registeredAt: new Date(),
      favorites: [],
      documents: [],
      exchangeBadge: false,
      avatarUrl: googleData.picture || null,
      linkedinUrl: null
    });

    await user.save();
    console.log("Added a new user:", googleData.email);
    return user;
  } catch (error) {
    console.error("Error adding a user:", error);
    throw error;
  }
};

// update user's info if name/image has been changed in Google
// Email remains the same has to remain as @metropolia.fi
const updateUserFromGoogle = async (
  googleId: string,
  googleData: {
    email: string;
    name: string;
    picture?: string;
  }
) => {
  try {
    const user = await User.findOne({ googleId });

    if (!user) {
      throw new Error("User not found");
    }
    // update name and picture if changed
    user.userName = googleData.name;
    if (googleData.picture) {
      user.avatarUrl = googleData.picture;
    }

    await user.save();
    console.log("Updated user from Google:", googleData.email);
    return user;
  } catch (error) {
    console.error("Error updating user from Google:", error);
    throw error;
  }
};

// Find or add user to the database
const findOrCreateUser = async (googleData: {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}) => {
  try {
    const existingUser = await User.findOne({ googleId: googleData.googleId });

    if (existingUser) {
      // if user exists, update their info
      return await updateUserFromGoogle(googleData.googleId, {
        email: googleData.email,
        name: googleData.name,
        picture: googleData.picture
      });
    } else {
      // if user doesn't exist yet, add them
      return await createUser(googleData);
    }
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    throw error;
  }
};

// format user response that is sent to client
const formatUserProfile = (user: {
  id: string;
  userName: string;
  email: string;
  registeredAt: Date;
  favorites: string[];
  documents: string[];
  exchangeBadge?: boolean;
  avatarUrl?: string;
  linkedinUrl?: string;
}): ProfileResponse => {
  return {
    id: user.id,
    userName: user.userName,
    email: user.email,
    registeredAt: user.registeredAt.toISOString(),
    favorites: user.favorites,
    documents: user.documents,
    exchangeBadge: user.exchangeBadge,
    avatarUrl: user.avatarUrl,
    linkedinUrl: user.linkedinUrl
  };
};

// get user profile by Google ID
const getUserProfile = async (
  req: Request<{}, {}, { googleId: string }>,
  res: Response<ProfileResponse | MessageResponse>,
  next: NextFunction
) => {
  try {
    const { googleId } = req.body;

    if (!googleId) {
      next(new CustomError("Google ID not provided", 400));
      return;
    }

    const user = await User.findOne({ googleId });

    if (!user) {
      next(new CustomError("User not found", 404));
      return;
    }

    // format and send user profile
    res.status(200).json(formatUserProfile(user));
  } catch (error) {
    console.error("Error fetching user profile:", error);
    next(new CustomError("Failed to fetch user profile", 500));
  }
};

// update user profile
// Email remains the same has to remain as @metropolia.fi
const updateUserProfile = async (
  req: Request<{}, {}, Partial<ProfileResponse> & { googleId: string }>,
  res: Response<ProfileResponse | MessageResponse>,
  next: NextFunction
) => {
  try {
    const { googleId, ...updates } = req.body;

    if (!googleId) {
      next(new CustomError("Google ID not provided", 400));
      return;
    }

    const user = await User.findOne({ googleId });

    if (!user) {
      next(new CustomError("User not found", 404));
      return;
    }

    // Apply updates to allowed fields only
    if (updates.userName) user.userName = updates.userName;
    if (updates.linkedinUrl !== undefined) user.linkedinUrl = updates.linkedinUrl;
    if (updates.exchangeBadge !== undefined) user.exchangeBadge = updates.exchangeBadge;
    if (updates.favorites) user.favorites = updates.favorites;
    if (updates.documents) user.documents = updates.documents;

    if (updates.email && updates.email !== user.email) {
      console.warn(`Attempted to change email for user ${googleId}: ${user.email} -> ${updates.email}. Ignored.`);
    }

    await user.save();
    res.status(200).json(formatUserProfile(user));
  } catch (error) {
    console.error("Error updating user profile:", error);
    next(new CustomError("Failed to update user profile", 500));
  }
};

export {
  createUser,
  updateUserFromGoogle,
  findOrCreateUser,
  getUserProfile,
  updateUserProfile
};
