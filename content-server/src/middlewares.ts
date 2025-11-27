import {TokenContent} from 'va-hybrid-types/DBTypes';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {validationResult, body} from 'express-validator';
import CustomError from './classes/CustomError';
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import User from './api/models/userModel';
import {adminMiddleware as authAdminMiddleware} from '../../auth-server/src/middlewares';
import ExchangeStories from './api/models/ExchangeStoryModel';

// Middleware to handle 404 errors
const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError('Not Found', 404);
  next(error);
};

// Middleware to handle errors
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

const validateStory = [
  body('country')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('country is required'),
  body('city').isString().trim().notEmpty().withMessage('city is required'),
  body('university')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('university is required'),
  // add other fields/validations as needed
];
// story updating/deleting
const requireAuthOrAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const story = await ExchangeStories.findById(req.params.id);
    if (!story) return res.status(404).json({error: 'Story not found'});

    const user = res.locals.user;

    // Admin allowed by default
    if (user?.user_level_id === 2) return next();

    // Owner allowed
    if (story.createdBy?.toString() === user?._id.toString()) return next();

    return res.status(403).json({error: 'Not allowed'});
  } catch (err) {
    next(new CustomError((err as Error).message, 500));
  }
};

// Middleware to check for admin access or role assigned/authorized user
const adminMiddleware = authAdminMiddleware;
/* const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;

  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (user.user_level_id !== 2)
    return res.status(403).json({ error: 'Admin or authorization access required' });

  next();
};
*/

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
    //const user = await User.findById(decoded._id);
    const user = await User.findById(decoded._id);
    //console.log('Authenticated user:', user);
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
    console.error('Authentication error:', error);
    next(new CustomError((error as Error).message, 401));
  }
};

export {
  notFound,
  errorHandler,
  validationErrors,
  authenticate,
  adminMiddleware,
  requireAuthOrAdmin,
  validateStory,
};
