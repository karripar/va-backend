import express from 'express';
import {
  getInstructionLinks,
  updateInstructionLink,
  getInstructionVisibility,
  toggleInstructionVisibility,
  getInstructionSteps,
  updateInstructionStep,
} from '../controllers/instructionController';
import {authenticate, validationErrors} from '../../middlewares';
import {body, param} from 'express-validator';

const router = express.Router();

/**
 * @apiDefine InstructionGroup Instruction
 * APIs for managing instruction links and visibility.
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

/**
 * @apiDefine token Authentication required in the form of Bearer token in Authorization header.
 * @apiHeader {String} Authorization Bearer token.
 */

router
  .get(
    /**
     * @api {get} /instructions/links Get all instruction links
     * @apiName GetInstructionLinks
     * @apiGroup InstructionGroup
     * @apiVersion 1.0.0
     *
     * @apiDescription Retrieves all instruction links, sorted by step index. If no links exist, initializes with default links.
     * @apiPermission none
     *
     * @apiSuccess {Object[]} links List of instruction links.
     * @apiSuccess {String} links._id Unique ID of the link.
     * @apiSuccess {Number} links.stepIndex Index of the instruction step (0-8).
     * @apiSuccess {String} links.label Display text for the link.
     * @apiSuccess {String} links.href URL or internal route.
     * @apiSuccess {Boolean} links.isExternal Whether the link is external (opens in new tab).
     * @apiSuccess {Boolean} links.isFile Whether the link is a file (shows PDF icon).
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     [
     *       {
     *         "_id": "unique_link_id",
     *         "stepIndex": 0,
     *         "label": "Vaihtokohteet",
     *         "href": "/destinations",
     *         "isExternal": false,
     *         "isFile": false
     *       },
     *       ...
     *     ]
     *
     * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
     * @apiErrorExample {json} InternalServerError-Response:
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *       "message": "Failed to fetch instruction links"
     *     }
     */
    '/links',
    getInstructionLinks,
  )
  .put(
    /**
     * @api {put} /instructions/links/:linkId Update an instruction link
     * @apiName UpdateInstructionLink
     * @apiGroup InstructionGroup
     * @apiVersion 1.0.0
     *
     * @apiDescription Updates a specific instruction link. Admin only operation.
     * @apiPermission token
     *
     * @apiParam {String} linkId Unique ID of the link to update.
     *
     * @apiBody {String} [label] New display text for the link.
     * @apiBody {String} [href] New URL or internal route.
     * @apiBody {Boolean} [isExternal] Whether the link is external.
     * @apiBody {Boolean} [isFile] Whether the link is a file.
     *
     * @apiSuccess {String} message Success message.
     * @apiSuccess {Object} link Updated link object.
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "message": "Link updated successfully",
     *       "link": {
     *         "_id": "unique_link_id",
     *         "stepIndex": 0,
     *         "label": "Vaihtokohteet",
     *         "href": "/destinations",
     *         "isExternal": false,
     *         "isFile": false
     *       }
     *     }
     *
     * @apiError (400 Bad Request) BadRequest Label and href are required.
     * @apiErrorExample {json} BadRequest-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *       "message": "Label and href are required"
     *     }
     *
     * @apiError (403 Forbidden) Forbidden Only admins can update links.
     * @apiErrorExample {json} Forbidden-Response:
     *     HTTP/1.1 403 Forbidden
     *     {
     *       "message": "Unauthorized: Only admins can update links"
     *     }
     *
     * @apiError (404 Not Found) NotFound Link not found.
     * @apiErrorExample {json} NotFound-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       "message": "Link not found"
     *     }
     *
     * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
     * @apiErrorExample {json} InternalServerError-Response:
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *       "message": "Failed to update instruction link"
     *     }
     *
     * @apiError (401 Unauthorized) Unauthorized Missing or invalid authentication token.
     * @apiErrorExample {json} Unauthorized-Response:
     *     HTTP/1.1 401 Unauthorized
     *     {
     *       "message": "Unauthorized"
     *     }
     */
    '/links/:linkId',
    authenticate,
    updateInstructionLink,
  );

router
  .get(
    /**
     * @api {get} /instruction/visibility Get all instruction visibility settings
     * @apiName GetInstructionVisibility
     * @apiGroup InstructionGroup
     * @apiVersion 1.0.0
     *
     * @apiDescription Retrieves visibility settings for all instruction steps. If no settings exist, initializes with all steps visible.
     * @apiPermission none
     *
     * @apiSuccess {Object[]} visibility List of visibility settings.
     * @apiSuccess {String} visibility._id Unique ID of the setting.
     * @apiSuccess {Number} visibility.stepIndex Index of the instruction step (0-8).
     * @apiSuccess {Boolean} visibility.isVisible Whether the step is visible to users.
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     [
     *       {
     *         "_id": "unique_visibility_id",
     *         "stepIndex": 0,
     *         "isVisible": true
     *       },
     *       ...
     *     ]
     *
     * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
     * @apiErrorExample {json} InternalServerError-Response:
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *       "message": "Failed to fetch instruction visibility"
     *     }
     */
    '/visibility',
    getInstructionVisibility,
  )
  .put(
    /**
     * @api {put} /instructions/visibility/:stepIndex Toggle instruction step visibility
     * @apiName ToggleInstructionVisibility
     * @apiGroup InstructionGroup
     * @apiVersion 1.0.0
     *
     * @apiDescription Toggles visibility of a specific instruction step. Admin only operation.
     * @apiPermission token
     *
     * @apiParam {Number} stepIndex Index of the instruction step to toggle (0-8).
     *
     * @apiSuccess {String} message Success message indicating the step was toggled.
     * @apiSuccess {Object} visibility Updated visibility setting.
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "message": "Step 0 visibility toggled",
     *       "visibility": {
     *         "_id": "unique_visibility_id",
     *         "stepIndex": 0,
     *         "isVisible": false
     *       }
     *     }
     *
     * @apiError (400 Bad Request) BadRequest Invalid step index.
     * @apiErrorExample {json} BadRequest-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *       "message": "Invalid step index"
     *     }
     *
     * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
     * @apiErrorExample {json} InternalServerError-Response:
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *       "message": "Failed to toggle instruction visibility"
     *     }
     *
     * @apiError (401 Unauthorized) Unauthorized Missing or invalid authentication token.
     * @apiErrorExample {json} Unauthorized-Response:
     *     HTTP/1.1 401 Unauthorized
     *     {
     *       "message": "Unauthorized"
     *     }
     */
    '/visibility/:stepIndex',
    authenticate,
    toggleInstructionVisibility,
  );

router
  .get(
    /**
     * @api {get} /instructions/steps Get all instruction steps
     * @apiName GetInstructionSteps
     * @apiGroup InstructionGroup
     * @apiVersion 1.0.0
     *
     * @apiDescription Retrieves all instruction steps.
     * @apiPermission none
     *
     * @apiSuccess {Object[]} steps List of instruction steps.
     * @apiSuccess {String} steps._id Unique ID of the step.
     * @apiSuccess {Number} steps.stepIndex Index of the instruction step (0-8).
     * @apiSuccess {String} steps.content Content of the instruction step.
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     [
     *       {
     *         "_id": "unique_step_id",
     *         "stepIndex": 0,
     *         "content": "Step 1 content"
     *       },
     *       ...
     *     ]
     *
     * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
     * @apiErrorExample {json} InternalServerError-Response:
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *       "message": "Failed to fetch instruction steps"
     *     }
     */
    '/steps',
    getInstructionSteps,
  )
  .put(
    /**
     * @api {put} /instructions/steps/:stepIndex Update an instruction step
     * @apiName UpdateInstructionStep
     * @apiGroup InstructionGroup
     * @apiVersion 1.0.0
     *
     * @apiDescription Updates a specific instruction step. Admin only operation.
     * Partial updates are supported: only the provided, non-empty fields will be
     * updated — omitted or empty fields will NOT overwrite existing database values.
     *
     * @apiPermission token (admin users only: `user_level_id` 2 or 3)
     *
     * @apiParam {Number} stepIndex Index of the instruction step to update (0-8).
     *
     * @apiBody {String} [titleFi] New Finnish title (optional, max 150 characters, plain text)
     * @apiBody {String} [titleEn] New English title (optional, max 150 characters, plain text)
     * @apiBody {String} [textFi] New Finnish text (optional, max 4000 characters, plain text)
     * @apiBody {String} [textEn] New English text (optional, max 4000 characters, plain text)
     *
     * @apiSuccess {String} message Success message.
     * @apiSuccess {Object} step Updated step object containing `stepIndex`, `titleFi`, `titleEn`, `textFi`, `textEn`.
     * @apiSuccessExample {json} Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "message": "Step updated successfully",
     *       "step": {
     *         "stepIndex": 0,
     *         "titleFi": "",
     *         "titleEn": "Updated title",
     *         "textFi": "",
     *         "textEn": "Updated text"
     *       }
     *     }
     *
     * @apiError (400 Bad Request) BadRequest Validation errors (e.g. field too long or contains HTML tags).
     * @apiErrorExample {json} ValidationError-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *       "message": "Validation failed",
     *       "errors": ["titleEn too long", "textEn must be plain text (no HTML tags)"]
     *     }
     *
     * @apiError (403 Forbidden) Forbidden Only admins can update steps.
     * @apiErrorExample {json} Forbidden-Response:
     *     HTTP/1.1 403 Forbidden
     *     {
     *       "message": "Unauthorized: Only admins can update steps"
     *     }
     *
     * @apiError (404 Not Found) NotFound Step not found.
     * @apiErrorExample {json} NotFound-Response:
     *     HTTP/1.1 404 Not Found
     *     {
     *       "message": "Step not found"
     *     }
     *
     * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
     * @apiErrorExample {json} InternalServerError-Response:
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *       "message": "Failed to update instruction step"
     *     }
     */
    '/steps/:stepIndex',
    authenticate,
    param('stepIndex').isInt({min: 0}).withMessage('Invalid step index'),
    body('titleFi')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .isLength({max: 150})
      .withMessage('titleFi too long')
      .withMessage('titleFi must be a non-empty string')
      .bail()
      .custom((v) => !/<[^>]+>/.test(v))
      .withMessage('titleFi must be plain text (no HTML tags)'),
    body('titleEn')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .isLength({max: 150})
      .withMessage('titleEn too long')
      .withMessage('titleEn must be a non-empty string')
      .bail()
      .custom((v) => !/<[^>]+>/.test(v))
      .withMessage('titleEn must be plain text (no HTML tags)'),
    body('textFi')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .isLength({max: 4000})
      .withMessage('textFi too long')
      .withMessage('textFi must be a non-empty string')
      .bail()
      .custom((v) => !/<[^>]+>/.test(v))
      .withMessage('textFi must be plain text (no HTML tags)'),
    body('textEn')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .isLength({max: 4000})
      .withMessage('textEn too long')
      .withMessage('textEn must be a non-empty string')
      .bail()
      .custom((v) => !/<[^>]+>/.test(v))
      .withMessage('textEn must be plain text (no HTML tags)'),
    validationErrors,
    updateInstructionStep,
  );

export default router;
