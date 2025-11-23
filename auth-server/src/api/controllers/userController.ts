import {Request, Response, NextFunction} from 'express';
import {MessageResponse} from '../../types/MessageTypes';
import CustomError from '../../classes/CustomError';
import {ProfileResponse} from 'va-hybrid-types/contentTypes';
import User from '../models/userModel';

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
    // First, try to find user by Google ID
    let user = await User.findOne({googleId: googleData.googleId});

    if (user) {
      // Existing user: update profile info, preserve role
      return await updateUserFromGoogle(googleData.googleId, {
        email: googleData.email,
        name: googleData.name,
        avatarUrl: googleData.picture,
      });
    }

    // Next, check if a placeholder admin exists by email
    user = await User.findOne({email: googleData.email});

    if (user) {
      // Link Google ID to the existing placeholder account
      if (!user.googleId) user.googleId = googleData.googleId;

      await user.save();

      // Update other profile info if needed, preserve user_level_id
      return await updateUserFromGoogle(user.googleId!, {
        email: googleData.email,
        name: googleData.name,
        avatarUrl: googleData.picture,
      });
    }

    // Otherwise, create a new regular user
    const newUser = new User({
      googleId: googleData.googleId,
      email: googleData.email,
      userName: googleData.name,
      user_level_id: 1, // default level
      avatarUrl: googleData.picture,
      registeredAt: new Date(),
    });

    await newUser.save();
    return newUser;
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
    user.email = googleData.email;
    if (googleData.avatarUrl) {
      user.avatarUrl = googleData.avatarUrl;
    }

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

/**
 * @function searchUsersByEmail
 * @description Searches for users by email. Only accessible to admin users.
 * Supports partial and case-insensitive matches.
 *
 * @param {Request<{ email: string }>} req - Express request object with email in params.
 * @param {Response<{ users?: ProfileResponse[]; error?: string }>} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: Array of matched user profiles.
 * - 403: If user is not an admin.
 * - 500: On server errors.
 *
 * @example
 * // GET /api/v1/users/search/by-email/:email
 * // Requires: Authorization header with admin token
 * searchUsersByEmail(req, res, next);
 */
const searchUsersByEmail = async (
  req: Request<{email: string}>,
  res: Response<{users?: ProfileResponse[]; error?: string}>,
  next: NextFunction,
) => {
  try {
    const adminUser = res.locals.user;
    if (![2, 3].includes(adminUser.user_level_id)) {
      return res.status(403).json({error: 'Unauthorized, not an admin'});
    }

    const {email} = req.params;

    // Partial, case-insensitive match
    const matchedUsers = await User.find({
      email: {$regex: email, $options: 'i'},
    });

    const responseUsers: ProfileResponse[] = matchedUsers.map((user) => ({
      _id: user._id.toString(),
      email: user.email,
      userName: user.userName,
      user_level_id: user.user_level_id,
      avatarUrl: user.avatarUrl,
      registeredAt: user.registeredAt,
      isBlocked: user.isBlocked,
      favorites: [], // Ensure favorites is included
      documents: [], // Ensure documents is included
    }));

    res.status(200).json({users: responseUsers});
  } catch (err) {
    next(
      err instanceof CustomError
        ? err
        : new CustomError('An error occurred while searching users', 500),
    );
  }
};


/** * @function deleteUser
 * @description Deletes a user by ID. Only elevated admins (user_level_id = 3) can perform this action.
 * Prevents deletion of other elevated admins. Users have to request deletion through support.
 *
 * @param {Request} req - Express request object with user ID in params.
 * @param {Response<MessageResponse>} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: Success message on deletion.
 * - 403: If requester is not an elevated admin or tries to delete an elevated admin.
 * - 404: If user to delete is not found.
 * - 500: On server errors.
 *
 * @example
 * // DELETE /api/v1/users/:id
 * // Requires: Authorization header with elevated admin token
 * deleteUser(req, res, next);
 */
const deleteUser = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id;

    const admin = res.locals.user;
    if (admin.user_level_id !== 3) {
      return res.status(403).json({message: 'Unauthorized, not an elevated admin'});
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    if (user.user_level_id === 3) {
      return res.status(403).json({message: 'Cannot delete elevated admin users'});
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({message: 'User deleted successfully'});
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};


/** * @function toggleBlockUser
 * @description Toggles the blocked status of a user by ID. Only elevated admins (user_level_id = 3) can perform this action.
 * Prevents blocking of other elevated admins.
 *
 * @param {Request} req - Express request object with user ID in params.
 * @param {Response<MessageResponse>} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: Success message on blocking/unblocking.
 * - 403: If requester is not an elevated admin or tries to block an elevated admin.
 * - 404: If user to block/unblock is not found.
 * - 500: On server errors.
 *
 * @example
 * // PUT /api/v1/users/block/:id
 * // Requires: Authorization header with elevated admin token
 * toggleBlockUser(req, res, next);
 */
const toggleBlockUser = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction,
 ) => {
  try {
    const userId = req.params.id;

    const admin = res.locals.user;
    if (![2, 3].includes(admin.user_level_id)) {
      return res.status(403).json({message: 'Unauthorized, not an admin'});
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    if (user.user_level_id === 3) {
      return res.status(403).json({message: 'Cannot block elevated admin users'});
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    const action = user.isBlocked ? 'blocked' : 'unblocked';
    res.status(200).json({message: `User successfully ${action}`});
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};


/** * @function getBlockedUsers
 * @description Retrieves a list of all blocked users. Only accessible to elevated admins (user_level_id = 2 or 3).
 *
 * @param {Request} req - Express request object.
 * @param {Response<ProfileResponse[] | MessageResponse>} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<ProfileResponse[]>} Array of blocked user profiles.
 * @throws {Error} If requester is not an elevated admin or on server errors.
 *
 * @example
 * // GET /api/v1/users/blocked
 * // Requires: Authorization header with elevated admin token
 * const blockedUsers = await getBlockedUsers(req, res, next);
 */
const getBlockedUsers = async (
  req: Request,
  res: Response<{ blockedUsers: Partial<ProfileResponse[]> } | MessageResponse>,
  next: NextFunction,
) => {
  try {
    const adminUser = res.locals.user;
    if (![2, 3].includes(adminUser.user_level_id)) {
      return res.status(403).json({ message: "Unauthorized, not an admin" });
    }

    const blockedUsers = await User.find({ isBlocked: true });

    return res.status(200).json({
      blockedUsers: blockedUsers.map((user) => ({
        _id: user._id.toString(),
        email: user.email,
        userName: user.userName,
        user_level_id: user.user_level_id,
        avatarUrl: user.avatarUrl,
        registeredAt: user.registeredAt,
        isBlocked: user.isBlocked,
        favorites: [], // Ensure favorites is included
        documents: [], // Ensure documents is included
      })),
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};




export {
  updateUserFromGoogle,
  getUserProfile,
  findOrCreateUser,
  searchUsersByEmail,
  deleteUser,
  toggleBlockUser,
  getBlockedUsers
};
