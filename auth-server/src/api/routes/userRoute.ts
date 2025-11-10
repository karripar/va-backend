import express from 'express';
import {getUserProfile} from '../controllers/userController';
import {authenticate} from '../../middlewares';

const router = express.Router();

/**
 * @apiDefine UserGroup User Management
 * Endpoints for user profile management.
 */

/**
 * @api {get} /users/profile Get User Profile
 * @apiName GetUserProfile
 * @apiGroup UserGroup
 * @apiVersion 1.0.0
 * @apiDescription Get user profile using JWT authentication.
 * @apiPermission JWT token required
 *
 * @apiHeader {String} Authorization Bearer JWT token.
 *
 * @apiSuccess {String} id User's unique identifier.
 * @apiSuccess {String} userName User's display name.
 * @apiSuccess {String} email Email address of the user.
 * @apiSuccess {String} registeredAt Registration date in ISO format.
 * @apiSuccess {String[]} favorites Array of favorite destination IDs.
 * @apiSuccess {String[]} documents Array of document IDs.
 * @apiSuccess {Boolean} [exchangeBadge] Exchange student badge status.
 * @apiSuccess {String} [avatarUrl] URL of user's profile picture.
 * @apiSuccess {String} [linkedinUrl] URL of user's LinkedIn profile.
 * @apiSuccess {String} [user_level_name] User's role level.
 */
router.get('/profile', authenticate, getUserProfile);

/**
 * @api {put} /users/profile Update User Profile
 * @apiName UpdateUserProfile
 * @apiGroup UserGroup
 * @apiVersion 1.0.0
 * @apiDescription Update user profile information using JWT authentication.
 * @apiPermission JWT token required
 *
 * @apiHeader {String} Authorization Bearer JWT token.
 * @apiBody {String} [userName] User's display name.
 * @apiBody {String} [linkedinUrl] URL of user's LinkedIn profile.
 * @apiBody {Boolean} [exchangeBadge] Exchange student badge status.
 * @apiBody {String[]} [favorites] Array of favorite destination IDs.
 * @apiBody {String[]} [documents] Array of document IDs.
 */

export default router;
