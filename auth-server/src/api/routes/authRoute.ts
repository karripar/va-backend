import express from "express";
import { verifyGoogleToken } from "../controllers/authController";
import { body } from "express-validator";
const router = express.Router();
import { validationErrors } from "../../middlewares";

/**
 * @apiDefine AuthGroup Authentication
 * Endpoints for user authentication and authorization.
 */

/**
 * @apiDefine token Authentication required in the form of a Bearer token in the Authorization header.
 * @apiHeader {String} Authorization Bearer token.
 */

/**
 * @apiDefine unauthorized Unauthorized
 * @apiError (401) Unauthorized User is not authorized to access the resource.
 * @apiErrorExample {json} Unauthorized:
 * {
 *  "message": "Unauthorized"
 * }
 */

router.post(
  /**
   * @api {post} /auth/google/verify Verify Google Token
   * @apiName VerifyGoogleToken
   * @apiGroup AuthGroup
   * @apiVersion 1.0.0
   * @apiDescription Verifies a Google OAuth token and retrieves user information.
   * @apiPermission none
   *
   * @apiBody {String} token Google OAuth token to be verified.
   *
   * @apiSuccess {String} googleId Unique identifier for the Google user.
   * @apiSuccess {String} email Email address of the Google user.
   * @apiSuccess {String} name Full name of the Google user.
   * @apiSuccess {String} picture URL of the Google user's profile picture.
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "googleId": "1234567890",
   *   "email": "user@email.com",
   *   "name": "John Doe",
   *   "picture": "https://lh3.googleusercontent.com/a-/AOh14Gg..."
   * }
   *
   * @apiError (400) BadRequest Token is missing or invalid.
   * @apiErrorExample {json} BadRequest-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "message": "Token not provided"
   * }
   *
   * @apiError (500) InternalServerError Server error or Google client ID not set.
   * @apiErrorExample {json} InternalServerError-Response:
   * HTTP/1.1 500 Internal Server Error
   * {
   *   "message": "Failed to verify token"
   * }
   */
  "/google/verify",
  body("idToken")
    .notEmpty().withMessage("Token must not be empty")
    .isString().withMessage("Token must be a string"),
  validationErrors,
  verifyGoogleToken
);

export default router;
