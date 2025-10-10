import {OAuth2Client} from 'google-auth-library';
import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import {findOrCreateUser} from './userController';
import jwt from 'jsonwebtoken';
import {GoogleResponse} from '../../types/LocalTypes';
import {TokenContent} from 'va-hybrid-types/DBTypes';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || '';

// verify Google ID token and return JWT token if successful
const verifyGoogleToken = async (
  req: Request<{}, {}, {idToken: string}>,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('verifyGoogleToken called with body:', req.body);

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
    };

    // find or add a new user in database
    const user = await findOrCreateUser(googleResponse);

    const tokenContent: TokenContent = {
      id: user.id,
      level_name: user.user_level_name || 'User',
    };

    const token = jwt.sign(tokenContent, JWT_SECRET, {expiresIn: '3h'});

    res.json({
      message: 'Authentication successful',
      token,
      user: user,
    });
  } catch (error) {
    console.error('Error in verifyGoogleToken:', error);
    next(new CustomError('Failed to verify token', 500));
  }
};

export {verifyGoogleToken};
