import {TokenContent} from 'va-hybrid-types/DBTypes';
/* eslint-disable @typescript-eslint/no-unused-vars */
<<<<<<< HEAD
import { validationResult, body} from "express-validator";
import CustomError from "./classes/CustomError";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "./api/models/userModel";
import ExchangeStories from './api/models/storyModel';
=======
import {validationResult, body} from 'express-validator';
import CustomError from './classes/CustomError';
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import User from './api/models/userModel';
// don't cross import from another server, it will otherwise create circular dependencies and builds both servers to dist
import ExchangeStories from './api/models/ExchangeStoryModel';
>>>>>>> dev-test

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
<<<<<<< HEAD
  body('university').isString().trim().notEmpty().withMessage('university is required'),
  body('title').isString().trim().notEmpty().withMessage('title is required'),
  body('content').isString().trim().notEmpty().withMessage('content is required'),
];

//Story CRUD operations --> admin only
const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = res.locals.user;

  console.log('Admin middleware check:', {
    hasUser: !!user,
    userId: user?._id,
    userLevelId: user?.user_level_id,
    email: user?.email
  });
=======
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
//Story updating/deleting/posting --> admin or owner
const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Loading user's level, Admin/User/SuperAdmin
  // const level = await UserLevel.findOne({ user_level_id: user.user_level_id });
  // if (!level) {
  //   return res.status(403).json({ error: "Invalid user level" });
  // }
  // // Allowing Admin and SuperAdmin
  // if (level.level_name !== "Admin" && level.level_name !== "SuperAdmin") {
  //   return res.status(403).json({ error: "Admin access required" });
  // }
  // next();

  if (![2, 3].includes(user.user_level_id)) { // Assuming 2 is Admin level
    return res.status(403).json({ error: "Admin access required" });
  }
>>>>>>> dev-test

  // Check user_level_id: 1 = User, 2 = Admin, 3 = Elevated Admin
  // Allow both level 2 and 3 as admins
  if (!user || (user.user_level_id !== 2 && user.user_level_id !== 3)) {
    console.log('Admin access denied - user_level_id:', user?.user_level_id);
    return res.status(403).json({ error: "Admin access required" });
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

<<<<<<< HEAD
  // decode the user_id from the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenContent;

  console.log('JWT decoded:', { _id: decoded._id });

  const user = await User.findById(decoded._id);
  console.log('User found in DB:', {
    found: !!user,
    userId: user?._id,
    email: user?.email,
    user_level_id: user?.user_level_id
  });

  if (!user) {
    next(new CustomError('Unauthorized, user not found', 401));
    return;
  }
=======
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
>>>>>>> dev-test

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

<<<<<<< HEAD
export {notFound, errorHandler, validationErrors, authenticate, adminMiddleware, validateStory};
=======
export {
  notFound,
  errorHandler,
  validationErrors,
  authenticate,
  adminMiddleware,
  requireAuthOrAdmin,
  validateStory,
};
>>>>>>> dev-test
