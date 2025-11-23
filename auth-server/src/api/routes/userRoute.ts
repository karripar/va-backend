import express from 'express';
import {
  getUserProfile,
  searchUsersByEmail,
  deleteUser,
  toggleBlockUser,
  getBlockedUsers
} from '../controllers/userController';
import {authenticate} from '../../middlewares';
import {param} from 'express-validator';

const router = express.Router();

/**
 * @apiDefine UserGroup User Management
 * Endpoints for user profile management.
 */

/**
 * @apiDefine token Authentication required in the form of Bearer token in Authorization header.
 * @apiHeader {String} Authorization Bearer token.
 */

/**
 * @apiDefine unauthorized Unauthorized
 * @apiError (401 Unauthorized) Unauthorized Missing or invalid authentication token.
 * @apiErrorExample {json} Unauthorized-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "Unauthorized"
 *     }
 */

router.get(
  /**
   * @api {get} /users/profile Get User Profile
   * @apiName GetUserProfile
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Retrieves the authenticated user's profile information.
   * @apiPermission token
   *
   * @apiSuccess {String} id User's unique identifier.
   * @apiSuccess {String} userName User's display name.
   * @apiSuccess {String} email Email address of the user.
   * @apiSuccess {String} registeredAt Registration date in ISO format.
   * @apiSuccess {Number} user_level_id User's role level (1 = user, 2 = admin).
   * @apiSuccess {String} [avatarUrl] URL of user's profile picture.
   * @apiSuccess {String} [linkedinUrl] URL of user's LinkedIn profile.
   * @apiSuccess {Boolean} [exchangeBadge] Exchange student badge status.
   * @apiSuccess {String[]} [favorites] Array of favorite destination IDs.
   * @apiSuccess {Object[]} [documents] Array of user documents.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "id": "user_id",
   *       "userName": "John Doe",
   *       "email": "user@email.com",
   *       "registeredAt": "2024-01-01T00:00:00.000Z",
   *       "user_level_id": 1,
   *       "avatarUrl": "https://example.com/avatar.jpg",
   *       "linkedinUrl": "https://linkedin.com/in/johndoe",
   *       "exchangeBadge": true,
   *       "favorites": ["dest1", "dest2"],
   *       "documents": []
   *     }
   *
   * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to fetch profile"
   *     }
   *
   * @apiError (401 Unauthorized) Unauthorized Missing or invalid authentication token.
   * @apiErrorExample {json} Unauthorized-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "message": "Unauthorized"
   *     }
   */
  '/profile',
  authenticate,
  getUserProfile,
);

router.get(
  '/search/by-email/:email',
  /**
   * @api {get} /users/search/by-email/:email Search User by Email
   * @apiName SearchUserByEmail
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Searches for users by their email address. Accessible only to admin users.
   * @apiPermission token (admin only)
   * @apiParam {String} email Email address to search for.
   *
   * @apiSuccess {Object[]} users List of users matching the email search.
   * @apiSuccess {String} users.id User's unique identifier.
   * @apiSuccess {String} users.userName User's display name.
   * @apiSuccess {String} users.email Email address of the user.
   * @apiSuccess {String} users.registeredAt Registration date in ISO format.
   * @apiSuccess {Number} users.user_level_id User's role level (1 = user, 2 = admin).
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "users": [
   *         {
   *           "id": "user_id",
   *           "userName": "John Doe",
   *           "email": "johndoe@metropolia.fi",
   *           "registeredAt": "2024-01-01T00:00:00.000Z",
   *           "user_level_id": 1
   *         }
   *       ]
   *     }
   *
   * @apiError (403 Forbidden) Forbidden The requester is not an admin.
   * @apiErrorExample {json} Forbidden-Response:
   *     HTTP/1.1 403 Forbidden
   *     {
   *       "message": "Unauthorized, not an admin"
   *     }
   *
   * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to search users by email"
   *     }
   */
  param('email').isEmail().trim(),
  authenticate,
  searchUsersByEmail,
);

router.delete(
  '/:id',
  /**
   * @api {delete} /users/:id Delete User
   * @apiName DeleteUser
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Deletes a user by their ID. Accessible only to elevated admin users.
   * @apiPermission token (elevated admin only)
   * @apiParam {String} id User's unique identifier.
   *
   * @apiSuccess {Boolean} success Indicates if the deletion was successful.
   * @apiSuccess {String} message Confirmation message.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": true,
   *       "message": "User deleted successfully"
   *     }
   *
   * @apiError (403 Forbidden) Forbidden The requester is not an elevated admin.
   * @apiErrorExample {json} Forbidden-Response:
   *     HTTP/1.1 403 Forbidden
   *     {
   *       "message": "Forbidden, insufficient permissions"
   *     }
   *
   * @apiError (404 Not Found) NotFound The user with the specified ID does not exist.
   * @apiErrorExample {json} NotFound-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "message": "User not found"
   *     }
   *
   * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to delete user"
   *     }
   */
  param('id').isMongoId(),
  authenticate,
  deleteUser,
);

router.put(
  '/block/:id',
  /**
   * @api {put} /users/block/:id Block User
   * @apiName toggleBlockUser
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Blocks a user by their ID. Accessible only to admin users. If the user is already blocked, this will unblock them. Elevated admin users cannot be blocked.
   * @apiPermission token (elevated admin only)
   * @apiParam {String} id User's unique identifier.
   *
   * @apiSuccess {Boolean} success Indicates if the blocking was successful.
   * @apiSuccess {String} message Confirmation message.
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "success": true,
   *       "message": "User successfully blocked/unblocked"
   *     }
   *
   * @apiError (403 Forbidden) Forbidden The requester is not an elevated admin.
   * @apiErrorExample {json} Forbidden-Response:
   *     HTTP/1.1 403 Forbidden
   *     {
   *       "message": "Forbidden, insufficient permissions"
   *     }
   *
   * @apiError (404 Not Found) NotFound The user with the specified ID does not exist.
   * @apiErrorExample {json} NotFound-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "message": "User not found"
   *     }
   *
   * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to block/unblock user"
   *     }
   */
  param('id').isMongoId(),
  authenticate,
  toggleBlockUser,
);


router.get(
  '/blocked/users',
  /**
   * @api {get} /users/blocked/users Get Blocked Users
   * @apiName GetBlockedUsers
   * @apiGroup UserGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Retrieves a list of all blocked users. Accessible only to admin users.
   * @apiPermission token (admin only)
   *
   * @apiSuccess {Object[]} users List of blocked users.
   * @apiSuccess {String} users.id User's unique identifier.
   * @apiSuccess {String} users.userName User's display name.
   * @apiSuccess {String} users.email Email address of the user.
   * @apiSuccess {String} users.registeredAt Registration date in ISO format.
   * @apiSuccess {Number} users.user_level_id User's role level (1 = user, 2 = admin).
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "users": [
   *         {
   *           "id": "user_id",
   *           "userName": "John Doe",
   *           "email": "user@email.com",
   *           "registeredAt": "2024-01-01T00:00:00.000Z",
   *           "user_level_id": 1
   *         }
   *       ]
   *     }
   *
   * @apiError (403 Forbidden) Forbidden The requester is not an admin.
   * @apiErrorExample {json} Forbidden-Response:
   *     HTTP/1.1 403 Forbidden
   *     {
   *       "message": "Unauthorized, not an admin"
   *     }
   *
   * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to fetch blocked users"
   *     }
   */
  authenticate,
  getBlockedUsers,
);




export default router;
