import {Request, Response, NextFunction} from 'express';
import userModel from '../models/userModel';

/**
 * @module controllers/adminController
 * @description Controller functions for managing admin users.
 * Includes functions to promote users to admin, retrieve admin users, and remove admin status.
 */

/**
 * @function makeUserAdmin
 * @description Grants admin rights to a user with the specified email.
 *
 * @param {Request<{ email: string }>} req - Express request object containing the user's email in `req.params`.
 * @param {Response} res - Express response object used to send JSON responses.
 * @param {NextFunction} next - Express next middleware function for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When the user is successfully promoted to admin.
 * - 400: If the email parameter is invalid.
 * - 403: If the current user is not an admin.
 * - 404: If no user with the given email exists.
 *
 * @example
 * // PUT /api/v1/users/make-admin/:email
 * // Requires res.locals.user to be an admin
 * makeUserAdmin(req, res, next);
 */
const makeUserAdmin = async (
  req: Request<{email: string}, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {email} = req.params;

    const adminUser = res.locals.user;
    if (adminUser.user_level_id !== 3) {
      return res.status(403).json({error: 'Unauthorized, not an elevated admin'});
    }

    if (adminUser.email === email) {
      return res
        .status(400)
        .json({error: 'Admins cannot change their own admin status'});
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({error: 'Invalid email parameter'});
    }

    const user = await userModel.findOne({email: email});

    if (user?.user_level_id === 2 || user?.user_level_id === 3) {
      return res
        .status(400)
        .json({error: 'User is already an admin'});
    }

    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    user.user_level_id = 2; // Promote to admin
    await user.save();

    res
      .status(200)
      .json({message: `User with email ${email} is now an admin.`});
  } catch (error) {
    next(error);
  }
};

/**
 * @function getAdmins
 * @description Retrieves a list of all users with admin privileges.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object used to send JSON responses.
 * @param {NextFunction} next - Express next middleware function for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: An array of admin users.
 * - 403: If the current user is not an admin.
 *
 * @example
 * // GET /api/v1/users/admins
 * // Requires res.locals.user to be an admin
 * getAdmins(req, res, next);
 */
const getAdmins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = res.locals.user;
    if (![2, 3].includes(adminUser.user_level_id)) {
      return res.status(403).json({error: 'Unauthorized, not an admin'});
    }

    const admins = await userModel.find({user_level_id: 2});
    res.status(200).json({admins});
  } catch (error) {
    next(error);
  }
};

/**
 * @function removeAdminStatus
 * @description Removes admin rights from a user (sets them back to a regular user).
 * Only users with `user_level_id` 3 (super admins) are allowed to perform this action.
 *
 * @param {Request<{ email: string }>} req - Express request object containing the user's email in `req.params`.
 * @param {Response} res - Express response object used to send JSON responses.
 * @param {NextFunction} next - Express next middleware function for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When admin rights are successfully removed.
 * - 400: If the email parameter is invalid.
 * - 403: If the current user is not a super admin.
 * - 404: If no user with the given email exists.
 *
 * @example
 * // PUT /api/v1/users/remove-admin/:email
 * // Requires res.locals.user to be a super admin (user_level_id 3)
 * removeAdminStatus(req, res, next);
 */
const removeAdminStatus = async (
  req: Request<{email: string}, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {email} = req.params;
    const adminUser = res.locals.user;

    if (adminUser.user_level_id !== 3) {
      return res.status(403).json({error: 'Unauthorized, not an elevated admin'});
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({error: 'Invalid email parameter'});
    }

    const user = await userModel.findOne({email: email});
    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    user.user_level_id = 1; // Demote to regular user
    await user.save();

    res
      .status(200)
      .json({message: `User with email ${email} is no longer an admin.`});
  } catch (error) {
    next(error);
  }
};

export {makeUserAdmin, getAdmins, removeAdminStatus};
