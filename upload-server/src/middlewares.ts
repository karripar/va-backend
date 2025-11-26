import { TokenContent } from 'va-hybrid-types/DBTypes';
import {validationResult} from 'express-validator';
import CustomError from './classes/CustomError';
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import User from './api/models/userModel';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
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

    // decode the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as TokenContent;

    const user = await User.findById(decoded._id);
    console.log('Authenticated user:', user);
    if (!user) {
      next(new CustomError('Unauthorized, user not found', 401));
      return;
    }

    if (user.isBlocked) {
      next(new CustomError('User is blocked', 403));
      return;
    }

    // set user info from token
    // Coerce user_level_id to a number to avoid string/number mismatches
    const rawLevel = (decoded as unknown as { user_level_id?: string | number }).user_level_id;
    let userLevelNumber: number | null = null;
    if (typeof rawLevel === 'string') {
      const parsed = parseInt(rawLevel, 10);
      userLevelNumber = Number.isNaN(parsed) ? null : parsed;
    } else if (typeof rawLevel === 'number') {
      userLevelNumber = rawLevel;
    }

    res.locals.user = {
      id: decoded._id,
      user_level_id: userLevelNumber,
    };

    next();
  } catch (error) {
    next(new CustomError((error as Error).message, 401));
  }
};

export {notFound, errorHandler, validationErrors, authenticate};
