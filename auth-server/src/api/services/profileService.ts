import {Request, Response, NextFunction} from 'express';
import User from '../models/userModel';
import {isValidEmail} from '../../utils/authHelpers';

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (req.body.email && !isValidEmail(req.body.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const profile = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const addFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({error: 'User not authenticated'});
    }

    const {destination} = req.body;

    if (!destination) {
      return res.status(400).json({error: 'Destination is required'});
    }

    if (!user.favorites.includes(destination)) {
      user.favorites.push(destination);
      await user.save();
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).json({error: 'User not authenticated'});
    }

    const {destination} = req.body;

    if (!destination) {
      return res.status(400).json({error: 'Destination is required'});
    }

    user.favorites = user.favorites.filter(
      (fav: string) => fav !== destination,
    );
    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
};
