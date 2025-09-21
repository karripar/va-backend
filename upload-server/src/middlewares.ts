/* eslint-disable @typescript-eslint/no-unused-vars */

import { validationResult } from "express-validator";
import CustomError from "./classes/CustomError";
import { NextFunction, Request, Response } from "express";


// Middleware to handle 404 errors
const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError('Not Found', 404);
  next(error);
}

// Middleware to handle errors
const errorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction) => {
  res.status(error.status || 500);
  res.json({
    message: error.message,
    status: error.status,
  });
}

// Middleware to check for validation errors
const validationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors.array().map((error) => error.msg).join(', ');
    next(new CustomError(messages, 400));
    return;
  }
  next();
}




export {notFound, errorHandler, validationErrors};
