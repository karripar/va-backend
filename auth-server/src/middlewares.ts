/* eslint-disable @typescript-eslint/no-unused-vars */

import CustomError from './classes/CustomError';
import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
import {TokenContent} from './types/LocalTypes';
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

// Middleware to authenticate the user
const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // get token from httpOnly cookie
    let token = req.cookies?.authToken;

    if (!token) {
      // fallback to Authorization header for development/testing
      token = req.headers.authorization?.split(' ')[1];
    }

    if (!token) {
      next(new CustomError('Unauthorized, no token provided', 401));
      return;
    }

    // decode the user's id from the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as TokenContent;

    const user = await User.findById(decoded.id);
    if (!user) {
      next(new CustomError('Unauthorized, user not found', 401));
      return;
    }

    res.locals.user = user;
    next();
  } catch (error) {
    next(new CustomError((error as Error).message, 401));
  }
};

export {notFound, errorHandler, validationErrors, authenticate};
