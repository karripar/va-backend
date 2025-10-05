import { Request, Response, NextFunction } from "express";
import contactModel from "../models/contactModel";
import {ContactMessage} from "va-hybrid-types/contentTypes";
import CustomError from '../../classes/CustomError';

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

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    next(new CustomError('Failed to post message', 500));
  }
}


const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const messages = await contactModel.find().sort({ createdAt: -1 });
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

    // TODO: Add authentication and authorization to ensure only authorized users can delete messages
    const { id } = req.params;
    const deletedMessage = await contactModel.findByIdAndDelete(id);

    if (!deletedMessage) {
      return next(new CustomError('Message not found', 404));
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    next(new CustomError('Failed to delete message', 500));
  }
}

export { postMessage, getMessages, deleteMessage };



