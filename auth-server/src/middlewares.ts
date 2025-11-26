import CustomError from './classes/CustomError';
import {NextFunction, Request, Response} from 'express';
import {validationResult, body} from 'express-validator';
import jwt from 'jsonwebtoken';
import ExchangeStories from './api/models/ExchangeStoryModel';
import User from './api/models/userModel';
import {TokenContent} from 'va-hybrid-types/DBTypes';

// Middleware to handle 404 errors
const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError('Not Found', 404);
  next(error);
};

// Middleware to handle errors
/* eslint-disable @typescript-eslint/no-unused-vars */
const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(error.status || 500);
  res.json({
    message: error.message,
    status: error.status,
  });
};

// Middleware to check for validation errors
const validationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => error.msg)
      .join(', ');
    next(new CustomError(messages, 400));
    return;
  }
  next();
};

//Story validations
const validateStory = [
  body('country').isString().trim().notEmpty().withMessage('country is required'),
  body('city').isString().trim().notEmpty().withMessage('city is required'),
  body('university').isString().trim().notEmpty().withMessage('university is required'),
    // more validations for the schema fields
];
// story updating/deleting
const requireAuthOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => { const story = await ExchangeStories.findById(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });

  if (req.user?.user_level_id === 2) return next(); // admin always allowed --> default update/delete access
  if (story.createdBy?.toString() === req.user?._id.toString()) return next(); //the owner allowed

  return res.status(403).json({ error: 'Not allowed' });
};

// Middleware to check for admin access or role assigned/authorized user
const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.user_level_id !== 2)
    return res.status(403).json({ error: 'Admin or authorization access required' });
  next();
};

// Middleware to authenticate the user
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      next(new CustomError('Unauthorized, no token provided', 401));
      return;
    }

    // decode the user_id from the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as TokenContent;

    const user = await User.findById(decoded._id);
    if (!user) {
      next(new CustomError('Unauthorized, user not found', 401));
      return;
    }

    if (user.isBlocked) {
      next(new CustomError('User is blocked', 403));
      return;
    }

    res.locals.user = user;
    next();
  } catch (error) {
    next(new CustomError((error as Error).message, 401));
  }
};

export {notFound, errorHandler, validationErrors, authenticate, validateStory, adminMiddleware, requireAuthOrAdmin};
