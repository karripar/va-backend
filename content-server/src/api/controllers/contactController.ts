import { Request, Response, NextFunction } from "express";
import contactModel from "../models/contactModel";
import { ContactMessage } from "va-hybrid-types/contentTypes";
import CustomError from "../../classes/CustomError";
import { sendAdminNotification } from "../../utils/emailService";
import { getAdminEmails } from "./adminController";

/**
 * @module controllers/contactController
 * @description Controller functions for handling contact messages, including posting,
 * replying, retrieving, and deleting messages. Supports admin notifications via email.
 */

/**
 * @function postMessage
 * @description Handles posting of new contact messages from users.
 * Saves the message to the database and sends a notification email to all admins.
 *
 * @param {Request<{}, {}, ContactMessage>} req - Express request object containing `name`, `email`, `subject`, and `message` in `req.body`.
 * @param {Response} res - Express response object used to send JSON responses.
 * @param {NextFunction} next - Express next middleware function for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 201: When the message is successfully saved and email notifications sent.
 * - 400: If any required fields are missing.
 * - 500: If saving or sending email fails.
 *
 * @example
 * // POST /api/v1/contact/message
 * // Body: { name: "John Doe", email: "john@example.com", subject: "Hello", message: "How are you?" }
 * postMessage(req, res, next);
 */
const postMessage = async (
  req: Request<{}, {}, ContactMessage>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return next(new CustomError("All fields are required", 400));
    }

    const newMessage = new contactModel({ name, email, subject, message });
    await newMessage.save();

    try {
      const adminEmails = await getAdminEmails();
      if (adminEmails.length > 0) {
        await sendAdminNotification(name, email, subject, message, adminEmails);
      } else {
        console.log("No admin emails found to send notification", adminEmails);
      }
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error saving contact message:", error);
    next(new CustomError("Failed to post message", 500));
  }
};

/**
 * @function replyToMessage
 * @description Allows an admin to reply to a contact message.
 * Adds the reply to the message’s `responses` array and updates its status to `"replied"`.
 *
 * @param {Request<{ id: string }, {}, { message: string }>} req - Express request object containing `id` in params and reply `message` in body.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When the reply is successfully added.
 * - 400: If reply message is missing.
 * - 401/403: If the user is not authorized.
 * - 404: If the message is not found.
 *
 * @example
 * // PUT /api/v1/contact/message/reply/:id
 * // Body: { message: "Thanks for reaching out!" }
 * replyToMessage(req, res, next);
 */
const replyToMessage = async (
  req: Request<{ id: string }, {}, { message: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = res.locals.user._id;
    const userLevel = res.locals.user.user_level_id;

    if (!adminId) {
      return next(new CustomError("Unauthorized, no id found for replier", 401));
    }

    if (userLevel !== 2) {
      return next(new CustomError("Unauthorized, not an admin", 403));
    }

    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return next(new CustomError("Reply message is required", 400));
    }

    const updatedMessage = await contactModel.findByIdAndUpdate(
      id,
      {
        $push: {
          responses: { message, adminId, sentAt: new Date() },
        },
        status: "replied",
      },
      { new: true }
    );

    if (!updatedMessage) {
      return next(new CustomError("Message not found", 404));
    }

    res.status(200).json({
      message: "Reply added successfully",
      updatedMessage,
    });
  } catch (error) {
    console.error("Error replying to contact message:", error);
    next(new CustomError("Failed to reply to message", 500));
  }
};

/**
 * @function getMessages
 * @description Retrieves all contact messages sorted by status (newest first).
 * Uses MongoDB aggregation to prioritize messages with status `"new"`, `"replied"`, `"closed"`.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object returning an array of messages.
 * @param {NextFunction} next - Express next middleware function for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: A sorted list of messages.
 * - 500: If fetching fails.
 *
 * @example
 * // GET /api/v1/contact/messages
 * getMessages(req, res, next);
 */
const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const messages = await contactModel.aggregate([
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "new"] }, then: 1 },
                { case: { $eq: ["$status", "replied"] }, then: 2 },
                { case: { $eq: ["$status", "closed"] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
      },
      { $sort: { statusOrder: 1, createdAt: -1 } },
    ]);

    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    next(new CustomError("Failed to fetch messages", 500));
  }
};

/**
 * @function deleteMessage
 * @description Deletes a contact message by ID.
 * Only admins (`user_level_id` = 2) are authorized to perform this action.
 *
 * @param {Request<{ id: string }>} req - Express request object containing message ID in params.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: When the message is successfully deleted.
 * - 401/403: If unauthorized.
 * - 404: If the message doesn’t exist.
 * - 500: On server errors.
 *
 * @example
 * // DELETE /api/v1/contact/message/:id
 * deleteMessage(req, res, next);
 */
const deleteMessage = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return next(new CustomError("Unauthorized, no user found", 401));
    }

    if (user.user_level_id !== 2) {
      return next(new CustomError("Forbidden, insufficient permissions", 403));
    }

    const { id } = req.params;
    const deletedMessage = await contactModel.findByIdAndDelete(id);

    if (!deletedMessage) {
      return next(new CustomError("Message not found", 404));
    }

    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    next(new CustomError("Failed to delete message", 500));
  }
};

export { postMessage, getMessages, deleteMessage, replyToMessage };
