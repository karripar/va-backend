import { Request, Response, NextFunction } from "express";
import userModel from "../models/userModel";

const makeUserAdmin = async (
  req: Request<{ email: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.params;
  
    const adminUser = res.locals.user;
    if (adminUser.user_level_id !== 2) {
      return res.status(403).json({ error: "Unauthorized, not an admin" });
    }

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Invalid email parameter" });
    }

    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.user_level_id = 2; // Set user as admin
    await user.save();

    res.status(200).json({ message: `User with email ${email} is now an admin.` });
  } catch (error) {
    next(error);
  }
};

const getAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminUser = res.locals.user;
    if (adminUser.user_level_id !== 2) {
      return res.status(403).json({ error: "Unauthorized, not an admin" });
    }

    const admins = await userModel.find({ user_level_id: 2 });
    res.status(200).json({ admins });
  } catch (error) {
    next(error);
  }
};

const removeAdminStatus = async (
  req: Request<{ email: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.params;
    const adminUser = res.locals.user;

    // Only super admins (user_level_id 3) can remove admin status
    if (adminUser.user_level_id !== 3) {
      return res.status(403).json({ error: "Unauthorized, not an admin" });
    }
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Invalid email parameter" });
    }
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.user_level_id = 1; // Set user as regular user
    await user.save();
    res.status(200).json({ message: `User with email ${email} is no longer an admin.` });
  } catch (error) {
    next(error);
  }
};

export { makeUserAdmin, getAdmins, removeAdminStatus };

