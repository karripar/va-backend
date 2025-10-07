import {OAuth2Client} from 'google-auth-library';
import {Request, Response, NextFunction} from 'express';
import {MessageResponse} from '../../types/MessageTypes';
import CustomError from '../../classes/CustomError';
import {findOrCreateUser, formatUserProfile} from './userController';
import jwt from 'jsonwebtoken';
import {
  AuthResponse,
  GoogleResponse,
  TokenContent,
} from '../../types/LocalTypes';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || '';

// verify Google ID token and return JWT token if successful
const verifyGoogleToken = async (
  req: Request<{}, {}, {idToken: string}>,
  res: Response<AuthResponse | MessageResponse>,
  next: NextFunction,
) => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      console.error('Google client ID not set in environment variables');
      next(new CustomError('Google client ID not set', 500));
      return;
    }

    // check if JWT secret is set
    if (!JWT_SECRET) {
      console.error('JWT secret not set in environment variables');
      next(new CustomError('JWT secret not set', 500));
      return;
    }

    if (!req.body.idToken) {
      console.error('No idToken provided in request');
      next(new CustomError('Token not provided', 400));
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: req.body.idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      console.error('No payload received from Google');
      next(new CustomError('Invalid token payload', 400));
      return;
    }

    const googleResponse: GoogleResponse = {
      googleId: payload.sub || '', // payload.sub id does not change so it can be used as database identifier
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture,
    };

    // find or add a new user in database
    const user = await findOrCreateUser(googleResponse);

    const tokenPayload: TokenContent = {
      id: user.id,
      user_level_name: user.user_level_name,
    };

    // generate JWT token
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '24h',
    });

    const userProfile = formatUserProfile(user);

    // Set JWT token as httpOnly cookie (not in localStorage)
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    // send response WITHOUT token --> it's in httpOnly cookie
    res.status(200).json({
      user: userProfile,
      message: 'Authentication successful',
    });
  } catch (error) {
    console.error('Error in verifyGoogleToken:', error);
    next(new CustomError('Failed to verify token', 500));
  }
};

// handle logout by clearing the httpOnly cookie
const logout = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction,
) => {
  try {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({message: 'Logout successful'});
  } catch (error) {
    console.error('Error during logout:', error);
    next(new CustomError('Failed to logout', 500));
  }
};

export {verifyGoogleToken, logout};
