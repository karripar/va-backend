import { Request, Response, NextFunction } from "express";
import contactModel from "../models/contactModel";
import {ContactMessage} from "va-hybrid-types/contentTypes";
import CustomError from '../../classes/CustomError';
import { sendAdminNotification } from "../../utils/emailService";
import { getAdminEmails } from "./adminController";

const postMessage = async (
  req: Request<{}, {}, ContactMessage>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return next(new CustomError('All fields are required', 400));
    }

    const newMessage = new contactModel({
      name,
      email,
      subject,
      message,
    });

    await newMessage.save();
    try {
      const adminEmails = await getAdminEmails();

      if (adminEmails.length > 0) {
      await sendAdminNotification(
        name,
        email,
        subject,
        message,
        adminEmails
      );
      } else {
        console.log('No admin emails found to send notification', adminEmails);
      }
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
    }

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    next(new CustomError('Failed to post message', 500));
  }
}


const replyToMessage = async (
  req: Request<{ id: string }, {}, { message: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = res.locals.user._id;
    console.log('Admin ID from token:', adminId);
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
          responses: {
            message,
            adminId,
            sentAt: new Date(),
          },
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
      updatedMessage: updatedMessage,
    });
  } catch (error) {
    console.error("Error replying to contact message:", error);
    next(new CustomError("Failed to reply to message", 500));
  }
};



const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const messages = await contactModel.aggregate([ // Using aggregation to sort by status and createdAt, new first
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
    console.error('Error fetching contact messages:', error);
    next(new CustomError('Failed to fetch messages', 500));
  }
}


const deleteMessage = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return next(new CustomError('Unauthorized, no user found', 401));
    }

    if (user.user_level_id !== 2) { // 2 is admin level
      return next(new CustomError('Forbidden, insufficient permissions', 403));
    }

    const { id } = req.params;
    const deletedMessage = await contactModel.findByIdAndDelete(id);

    if (!deletedMessage) {
      return next(new CustomError('Message not found', 404));
    }

    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    next(new CustomError('Failed to delete message', 500));
  }
}

export { postMessage, getMessages, deleteMessage, replyToMessage };



