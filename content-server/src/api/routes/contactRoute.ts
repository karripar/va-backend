import express from 'express';
import {body} from 'express-validator';
import {validationErrors} from '../../middlewares';
import { postMessage, getMessages, deleteMessage} from '../controllers/contactController';
import { contactMessageLimiter } from '../../utils/rateLimiters';

const router = express.Router();

/**
 * @apiDefine ContactGroup Contact
 * APIs for handling contact messages.
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
 * @apiDefine token Autenthication required in the form of Bearer token in Authorization header.
 * @apiHeader {String} Authorization Bearer token.
 */

router.post(
  /**
   * @api {post} /contact/message Send a contact message
   * @apiName PostContactMessage
   * @apiGroup ContactGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Sends a contact message. All fields are required.
   * @apiPermission none
   *
   * @apiBody {String} name Name of the sender.
   * @apiBody {String} email Email address of the sender.
   * @apiBody {String} subject Subject of the message.
   * @apiBody {String} message Content of the message.
   *
   * @apiSuccess {String} message Success message indicating that the contact message was sent successfully.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 201 Created
   *     {
   *       "message": "Message sent successfully"
   *     }
   *
   * @apiError (400 Bad Request) BadRequest Missing required fields or invalid data.
   * @apiErrorExample {json} BadRequest-Response:
   *     HTTP/1.1 400 Bad Request
   *     {
   *       "message": "All fields are required"
   *     }
   *
   * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to post message"
   *     }
   */
  '/message',
  body('name').isString().withMessage('Name must be a string'),
  body('email').isEmail().withMessage('Email must be a valid email address'),
  body('subject').isString().withMessage('Subject must be a string'),
  body('message').isString().withMessage('Message must be a string'),
  contactMessageLimiter,
  validationErrors,
  postMessage
).get(
  /**
   * @api {get} /contact/messages Get all contact messages
   * @apiName GetContactMessages
   * @apiGroup ContactGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Retrieves all contact messages, sorted by creation date in descending order.
   * @apiPermission token
   *
   * @apiSuccess {Object[]} messages List of contact messages.
   * @apiSuccess {String} messages._id Unique ID of the message.
   * @apiSuccess {String} messages.name Name of the sender.
   * @apiSuccess {String} messages.email Email address of the sender.
   * @apiSuccess {String} messages.subject Subject of the message.
   * @apiSuccess {String} messages.message Content of the message.
   * @apiSuccess {String} messages.createdAt Timestamp when the message was created.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "messages": [
   *         {
   *           "_id": "unique_message_id",
   *           "name": "Sender Name",
   *           "email": "test@email.com",
   *           "subject": "Message Subject",
   *           "message": "Message content",
   *           "createdAt": "2024-01-01T00:00:00.000Z"
   *         },
   *         ...
   *       ]
   *     }
   *
   * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to fetch messages"
   *     }
   *
   * @apiError (401 Unauthorized) Unauthorized Missing or invalid authentication token.
   * @apiErrorExample {json} Unauthorized-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "message": "Unauthorized"
   *     }
   */
  '/messages',
  getMessages
).delete(
  /**
   * @api {delete} /contact/message/:id Delete a contact message
   * @apiName DeleteContactMessage
   * @apiGroup ContactGroup
   * @apiVersion 1.0.0
   *
   * @apiDescription Deletes a specific contact message by its ID.
   * @apiPermission token
   *
   * @apiParam {String} id Unique ID of the contact message to delete.
   *
   * @apiSuccess {String} message Success message indicating that the contact message was deleted successfully.
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "message": "Message deleted successfully"
   *     }
   *
   * @apiError (404 Not Found) NotFound Contact message with the specified ID was not found.
   * @apiErrorExample {json} NotFound-Response:
   *     HTTP/1.1 404 Not Found
   *     {
   *       "message": "Message not found"
   *     }
   *
   * @apiError (500 Internal Server Error) InternalServerError Server error while processing the request.
   * @apiErrorExample {json} InternalServerError-Response:
   *     HTTP/1.1 500 Internal Server Error
   *     {
   *       "message": "Failed to delete message"
   *     }
   *
   * @apiError (401 Unauthorized) Unauthorized Missing or invalid authentication token.
   * @apiErrorExample {json} Unauthorized-Response:
   *     HTTP/1.1 401 Unauthorized
   *     {
   *       "message": "Unauthorized"
   *     }
   */
  '/message/:id',
  deleteMessage
);

export default router;
