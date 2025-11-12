import {Request, Response, NextFunction} from 'express';
import {MessageResponse} from '../../types/MessageTypes';
import CustomError from '../../classes/CustomError';
import {ProfileResponse} from 'va-hybrid-types/contentTypes';
import User from '../models/userModel';

// Find or add user to the database
const findOrCreateUser = async (googleData: {
  googleId: string;
  email: string;
  name: string;
}) => {
  try {
    const existingUser = await User.findOne({googleId: googleData.googleId});

    if (existingUser) {
      // if user exists, update their info
      return await updateUserFromGoogle(googleData.googleId, {
        email: googleData.email,
        name: googleData.name,
      });
    } else {
      // if user doesn't exist yet, create them
      const newUser = new User({
        googleId: googleData.googleId,
        email: googleData.email,
        userName: googleData.name,
        user_level_id: 1, // default user level
        registeredAt: new Date(),
      });

      await newUser.save();
      return newUser;
    }
  } catch (error) {
    console.error('Error in findOrCreateUser:', error);
    throw error;
  }
};

// update user's info if name has been changed in Google
const updateUserFromGoogle = async (
  googleId: string,
  googleData: {
    email: string;
    name: string;
  },
) => {
  try {
    const user = await User.findOne({googleId});

    if (!user) {
      throw new Error('User not found');
    }

    // update name if changed
    user.userName = googleData.name;

    await user.save();
    return user;
  } catch (error) {
    console.error('Error updating user from Google:', error);
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
    const user = res.locals.user as ProfileResponse;

    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }

    const profileResponse = user;
    res.status(200).json(profileResponse);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export {updateUserFromGoogle, getUserProfile, findOrCreateUser};
