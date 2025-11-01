import { makeUserAdmin, getAdmins } from "../controllers/adminController";
import { authenticate } from "../../middlewares";
import express from "express";
import { param } from "express-validator";
import { validationErrors } from "../../middlewares";

const router = express.Router();

/**
 * @apiDefine AdminGroup Admin Management
 * Endpoints for admin user management.
 */

/**
 * @api {put} /admin/make-admin/:email Make User Admin
 * @apiName MakeUserAdmin
 * @apiGroup AdminGroup
 * @apiVersion 1.0.0
 * @apiDescription Promote a user to admin status by their email. Only accessible by existing admins.
 * 
 * @apiPermission Admin JWT token required
 *
 * @apiHeader {String} Authorization Bearer JWT token of an admin user.   
 * @apiParam {String} email Email of the user to be promoted to admin.
 * 
 * @apiSuccess {String} message Confirmation message indicating the user has been promoted to admin.
 * 
 * @apiError (403) Unauthorized The requester is not an admin.
 * @apiError (404) UserNotFound The user with the specified email does not exist.
 * 
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "message": "User with email xxx is now an admin."
 * }
 * 
 * @apiErrorExample {json} Unauthorized-Response:
 * HTTP/1.1 403 Forbidden
 * {
 *   "error": "Unauthorized, not an admin"
 * }
 * 
 * @apiErrorExample {json} UserNotFound-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": "User not found"
 * }
 */
router.put(
  "/make-admin/:email",
  param("email").isString().trim(),
  validationErrors,
  authenticate,
  makeUserAdmin
);

router.get("/admins", 
/**
 * @api {get} /admin/admins Get Admin Users
 * @apiName GetAdmins
 * @apiGroup AdminGroup
 * 
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a list of all admin users. Only accessible by existing admins.
 * @apiPermission Admin JWT token required
 * 
 * @apiHeader {String} Authorization Bearer JWT token of an admin user.
 * 
 * @apiSuccess {Object[]} admins List of admin users.
 * @apiSuccess {String} admins.id Unique identifier of the admin user.
 * @apiSuccess {String} admins.userName Display name of the admin user.
 * @apiSuccess {String} admins.email Email address of the admin user.
 * @apiSuccess {String} admins.registeredAt Registration date of the admin user in ISO format.
 * @apiSuccess {String} admins.user_level_name Role level of the admin user.
 * 
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "admins": [
 *    {
 *     "id": "1234567890",
 *     "userName": "Admin User",
 *     "email": "admin@email.com",
 *     "registeredAt": "2023-01-01T00:00:00.000Z",
 *     "user_level_name": "Admin"
 *    }
 *  ]
 * }
 * 
 * @apiError (403) Unauthorized The requester is not an admin.
 * 
 * @apiErrorExample {json} Unauthorized-Response: 
 * HTTP/1.1 403 Forbidden
 * {
 *   "error": "Unauthorized, not an admin"
 * }
 */
authenticate,
getAdmins);


export default router;