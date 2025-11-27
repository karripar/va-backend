/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomError from './classes/CustomError';
import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
import User from './api/models/userModel';
//import UserLevel from './api/models/userLevelModel';
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

  const levelName = (user as any).user_level_id?.level_name ?? (user as any).user_level_name ?? (user as any).user_level_id;
  if (levelName !== 'Admin' && levelName !== 'SuperAdmin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

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

    //const user = await User.findById(decoded._id);

    const user = await User.findById(decoded._id).populate("user_level_id"); //--> The story posting was failing so I had to populate the user level here
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

export {notFound, errorHandler, validationErrors, authenticate, adminMiddleware};
