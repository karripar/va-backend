import {TokenContent} from 'va-hybrid-types/DBTypes';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {validationResult, body} from 'express-validator';
import CustomError from './classes/CustomError';
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import User from './api/models/userModel';
import ExchangeStories from './api/models/storyModel';

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
  body('title').isString().trim().notEmpty().withMessage('title is required'),
  body('content')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('content is required'),
];

//Story CRUD operations --> admin only
const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;

  console.log('Admin middleware check:', {
    hasUser: !!user,
    userId: user?._id,
    userLevelId: user?.user_level_id,
    email: user?.email,
    fullUser: user,
  });

  // Check user_level_id: 1 = User, 2 = Admin, 3 = Elevated Admin
  // Allow both level 2 and 3 as admins
  // Also check if user_level_id exists and convert to number if it's a string
  const userLevel = user?.user_level_id ? Number(user.user_level_id) : 1;

  if (!user || (userLevel !== 2 && userLevel !== 3)) {
    console.log('Admin access denied - user_level_id:', userLevel);
    return res.status(403).json({
      error: 'Admin access required',
      details: `Your user level is ${userLevel}. Admin access requires level 2 or 3.`,
    });
  }

  console.log('Admin access granted');
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

    console.log('JWT decoded:', {_id: decoded._id});

    const user = await User.findById(decoded._id).lean();
    console.log('User found in DB:', {
      found: !!user,
      userId: user?._id,
      email: user?.email,
      user_level_id: user?.user_level_id,
    });

    if (!user) {
      next(new CustomError('Unauthorized, user not found', 401));
      return;
    }

    if (user.isBlocked) {
      next(new CustomError('User is blocked', 403));
      return;
    }

    // Store user with proper type conversion
    res.locals.user = {
      ...user,
      _id: user._id.toString(),
      user_level_id: Number(user.user_level_id),
    };
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
  validateStory,
};
