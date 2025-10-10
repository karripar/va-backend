import {Request, Response, NextFunction} from 'express';
import {MessageResponse} from '../../types/MessageTypes';
import CustomError from '../../classes/CustomError';
import {ProfileResponse} from 'va-hybrid-types/contentTypes';
import {UserInfo} from '../../types/LocalTypes';
import User from '../models/userModel';
import {v4 as uuidv4} from 'uuid';

// convert User model type to ProfileResponse
const formatUserProfile = (user: UserInfo): ProfileResponse => {
  return {
    id: user.id,
    userName: user.userName,
    email: user.email,
    registeredAt: user.registeredAt,
    user_level_id: user.user_level_id,
    favorites: user.favorites,
    documents: [],
    exchangeBadge: user.exchangeBadge,
    avatarUrl:  '', // "https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser&mouth=default&eyes=default",,
    linkedinUrl: user.linkedinUrl,
  };
};

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
      userName: googleData.name,
      email: googleData.email,
      registeredAt: new Date(),
      favorites: [],
      documents: [],
      exchangeBadge: false,
      avatarUrl: googleData.picture || null,
      linkedinUrl: null,
      user_level_id: 1, // Default 1 = User
    });

    await user.save();
    return user;
  } catch (error) {
    console.error('Error adding a user:', error);
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
  },
) => {
  try {
    const user = await User.findOne({googleId});

    if (!user) {
      throw new Error('User not found');
    }

    // update name and picture if changed
    user.userName = googleData.name;

    // Ensure user_level_id is set
    if (!user.user_level_id) {
      user.user_level_id = 1; // Default user level ID
    }

    await user.save();
    return user;
  } catch (error) {
    console.error('Error updating user from Google:', error);
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
    const existingUser = await User.findOne({googleId: googleData.googleId});

    if (existingUser) {
      // if user exists, update their info
      return await updateUserFromGoogle(googleData.googleId, {
        email: googleData.email,
        name: googleData.name,
        picture:  '', // "https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser&mouth=default&eyes=default",
      });
    } else {
      // if user doesn't exist yet, add them
      return await createUser(googleData);
    }
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

// get user profile from JWT token
const getUserProfile = async (
  req: Request,
  res: Response<ProfileResponse | MessageResponse>,
  next: NextFunction,
) => {
  try {
    const user = res.locals.user as UserInfo;

    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }

    const profileResponse = formatUserProfile(user);
    res.status(200).json(profileResponse);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    next(new CustomError('Failed to fetch user profile', 500));
  }
};

// update user profile
// Email remains the same has to remain as @metropolia.fi
const updateUserProfile = async (
  req: Request<{}, {}, Partial<ProfileResponse>>,
  res: Response<ProfileResponse | MessageResponse>,
  next: NextFunction,
) => {
  try {
    const user = res.locals.user;
    const updates = req.body;

    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }

    if (updates.userName) user.userName = updates.userName;
    if (updates.linkedinUrl !== undefined)
      user.linkedinUrl = updates.linkedinUrl;
    if (updates.exchangeBadge !== undefined)
      user.exchangeBadge = updates.exchangeBadge;
    if (updates.favorites) user.favorites = updates.favorites;
    if (updates.documents) user.documents = updates.documents;

    if (updates.email && updates.email !== user.email) {
      console.warn(
        `Attempted to change email for user ${user.id}: ${user.email} -> ${updates.email}. Ignored.`,
      );
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    next(new CustomError('Failed to update user profile', 500));
  }
};

export {
  createUser,
  updateUserFromGoogle,
  findOrCreateUser,
  getUserProfile,
  updateUserProfile,
  formatUserProfile,
};
