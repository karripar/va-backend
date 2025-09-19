/* eslint-disable @typescript-eslint/no-unused-vars */

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






export {notFound, errorHandler};
