import {Request, Response, NextFunction} from 'express';
import {MessageResponse} from '../../types/MessageTypes';
import CustomError from '../../classes/CustomError';
import {ProfileResponse} from 'va-hybrid-types/contentTypes';
import User from '../models/userModel';
import { ADMIN_EMAILS, ELEVATED_ADMIN_EMAILS } from '../utils/admins';

const USER_LEVEL_DEFAULT = 1;
const USER_LEVEL_ADMIN = 2;
const USER_LEVEL_SUPERADMIN = 3;

const getUserLevelFromEmail = (email: string): number => {
  if (ELEVATED_ADMIN_EMAILS.has(email)) {
    return USER_LEVEL_SUPERADMIN;
  }
  if (ADMIN_EMAILS.has(email)) {
    return USER_LEVEL_ADMIN;
  }
  return USER_LEVEL_DEFAULT;
};

/**
 * @module controllers/userController
 * @description Controller functions for handling user authentication and profile management,
 * including Google OAuth integration, user creation, and profile retrieval.
 */

/**
 * @function findOrCreateUser
 * @description Finds an existing user by Google ID or creates a new user if not found.
 * If the user exists, updates their email and name from Google data.
 *
 * @param {Object} googleData - Google authentication data.
 * @param {string} googleData.googleId - Unique Google user ID.
 * @param {string} googleData.email - User's email from Google.
 * @param {string} googleData.name - User's name from Google.
 *
 * @returns {Promise<User>} The found or newly created user document.
 * @throws {Error} If database operation fails.
 *
 * @example
 * const user = await findOrCreateUser({
 *   googleId: '123456',
 *   email: 'user@example.com',
 *   name: 'John Doe'
 * });
 */
const findOrCreateUser = async (googleData: {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}) => {
  try {

    const userLevelId = getUserLevelFromEmail(googleData.email);

    const existingUser = await User.findOne({googleId: googleData.googleId});

    if (existingUser) {
      // if user exists, update their info
      return await updateUserFromGoogle(googleData.googleId, {
        email: googleData.email,
        name: googleData.name,
        user_level_id: userLevelId,
        avatarUrl: googleData.picture,
      });
    } else {
      // if user doesn't exist yet, create them
      const newUser = new User({
        googleId: googleData.googleId,
        email: googleData.email,
        userName: googleData.name,
        user_level_id: userLevelId, // default user level is 1
        avatarUrl: googleData.picture,
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

/**
 * @function updateUserFromGoogle
 * @description Updates an existing user's information (name and email) based on their Google profile data.
 * This ensures the local user data stays in sync with Google account changes.
 *
 * @param {string} googleId - The unique Google user ID.
 * @param {Object} googleData - Updated user data from Google.
 * @param {string} googleData.email - User's current email from Google.
 * @param {string} googleData.name - User's current name from Google.
 *
 * @returns {Promise<User>} The updated user document.
 * @throws {Error} If user is not found or database operation fails.
 *
 * @example
 * const updatedUser = await updateUserFromGoogle('123456', {
 *   email: 'newemail@example.com',
 *   name: 'Jane Doe'
 * });
 */
const updateUserFromGoogle = async (
  googleId: string,
  googleData: {
    email: string;
    name: string;
    user_level_id: number;
    avatarUrl?: string;
  },
) => {
  try {
    const user = await User.findOne({googleId});

    if (!user) {
      throw new Error('User not found');
    }

    // update name if changed
    user.userName = googleData.name;
    user.user_level_id = googleData.user_level_id;

    await user.save();
    return user;
  } catch (error) {
    console.error('Error updating user from Google:', error);
    throw error;
  }
};

/**
 * @function getUserProfile
 * @description Retrieves the authenticated user's profile from the JWT token stored in res.locals.
 * The user data is populated by the authentication middleware.
 *
 * @param {Request} req - Express request object.
 * @param {Response<ProfileResponse | MessageResponse>} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: User profile object with user details.
 * - 404: If user is not found.
 * - 500: On server errors.
 *
 * @example
 * // GET /api/v1/users/profile
 * // Requires authentication middleware
 * getUserProfile(req, res, next);
 */
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
