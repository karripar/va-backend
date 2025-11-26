import { makeUserAdmin, getAdmins, removeAdminStatus, makeAdminElevated} from "../controllers/adminController";
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
 * @apiDefine Token
 * @apiHeader {String} Authorization required in the form of bearer token.
 */

router.put(
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
  "/make-admin/:email",
  param("email").isString().trim(),
  validationErrors,
  authenticate,
  makeUserAdmin
);

router.put(
  /**
   * @api {put} /admin/elevate-admin/:id Elevate Admin to Elevated Admin
   * @apiName MakeAdminElevated
   * @apiGroup AdminGroup
   * @apiVersion 1.0.0
   * @apiDescription Promote an admin user to elevated admin status by their ID. Only accessible by existing elevated admins.
   *
   * @apiPermission Elevated Admin JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token of an elevated admin user.
   * @apiParam {String} id ID of the user to be promoted to elevated admin.
   * @apiSuccess {String} message Confirmation message indicating the user has been promoted to elevated admin.
   *
   * @apiError (403) Unauthorized The requester is not an elevated admin.
   * @apiError (404) UserNotFound The user with the specified ID does not exist.
   * @apiError (400) InvalidId The provided ID parameter is invalid.
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "message": "User with id: xxx is now an elevated admin."
   * }
   *
   * @apiErrorExample {json} Unauthorized-Response:
   * HTTP/1.1 403 Forbidden
   * {
   *   "error": "Unauthorized, not an elevated admin"
   * }
   * @apiErrorExample {json} UserNotFound-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "User not found"
   * }
   */
  "/elevate-admin/:id",
  param("id").isString().trim(),
  validationErrors,
  authenticate,
  makeAdminElevated
)

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

router.put(
  /**
   * @api {put} /admin/remove-admin/:id Remove Admin Status
   * @apiName RemoveAdminStatus
   * @apiGroup AdminGroup
   * @apiVersion 1.0.0
   * @apiDescription Demote an admin user to regular user status by their ID. Only accessible by super admins.
   *
   * @apiPermission Elevated Admin JWT token required
   *
   * @apiHeader {String} Authorization Bearer JWT token of a super admin user.
   * @apiParam {String} id ID of the user to be demoted from admin.
   *
   * @apiSuccess {String} message Confirmation message indicating the user has been demoted from admin.
   *
   * @apiError (403) Unauthorized The requester is not a super admin.
   * @apiError (404) UserNotFound The user with the specified ID does not exist.
   *
   * @apiError (400) InvalidId The provided ID parameter is invalid.
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "message": "User with id: xxx is no longer an admin."
   * }
   *
   * @apiErrorExample {json} Unauthorized-Response:
   * HTTP/1.1 403 Forbidden
   * {
   *   "error": "Unauthorized, not an elevated admin"
   * }
   * @apiErrorExample {json} UserNotFound-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": "User not found"
   * }
   *
   * @apiErrorExample {json} InvalidId-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": "Invalid id parameter"
   * }
   */
  "/remove-admin/:id",
  param("id").isString().trim(),
  validationErrors,
  authenticate,
  removeAdminStatus
);


export default router;
