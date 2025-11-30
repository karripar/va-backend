import CustomError from './classes/CustomError';
import {NextFunction, Request, Response} from 'express';
import {validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
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


<<<<<<< HEAD
=======
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

  next();
};
>>>>>>> dev-test

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

<<<<<<< HEAD
    const user = await User.findById(decoded._id);
=======
    //const user = await User.findById(decoded._id);

    const user = await User.findById(decoded._id); //--> The story posting was failing so I had to populate the user level here
>>>>>>> dev-test
    if (!user) {
      next(new CustomError('Unauthorized, user not found', 401));
      return;
    }

    if (user.isBlocked) {
      next(new CustomError('User is blocked', 403));
      return;
    }
    // story posting user role:
    let role = "User";
    if (user.user_level_id && typeof user.user_level_id === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role = (user.user_level_id as any).level_name || "User";
    }

   // res.locals.user = user;
   res.locals.user = {
    ...user.toObject(),
    role: role,
   };


    next();
  } catch (error) {
    next(new CustomError((error as Error).message, 401));
  }
};

export {notFound, errorHandler, validationErrors, authenticate};
