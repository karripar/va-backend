import { OAuth2Client } from 'google-auth-library';
import { Request, Response, NextFunction } from 'express';
import CustomError from '../../classes/CustomError';
import { findOrCreateUser } from './userController';
import jwt from 'jsonwebtoken';
import { GoogleResponse } from '../../types/LocalTypes';
import { TokenContent } from 'va-hybrid-types/DBTypes';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || '';

/**
 * @module controllers/authController
 * @description Controller functions for authentication-related operations.
 * Includes functions to verify Google ID tokens and manage user sessions.
 */

/**
 * Verifies a Google ID token received from the client and returns a JWT token upon success.
 *
 * This function performs the following steps:
 * 1. Validates the presence of Google and JWT configuration values.
 * 2. Verifies the Google ID token via the Google OAuth2 client.
 * 3. Extracts user information from the token payload.
 * 4. Finds or creates the user in the database.
 * 5. Signs and returns a new JWT containing the user’s ID and access level.
 *
 * @async
 * @function verifyGoogleToken
 * @param {Request} req - Express request object, containing `idToken` in the request body.
 * @param {Response} res - Express response object used to send the JWT and user data.
 * @param {NextFunction} next - Express next function for passing errors to middleware.
 * @returns {Promise<void>} Returns a JSON response with the JWT token and user info if successful.
 *
 * @throws {CustomError} If the Google client ID, JWT secret, or ID token is missing or invalid.
 * @throws {CustomError} If the Google payload is invalid or user verification fails.
 *
 * @example
 * // Example request body:
 * {
 *   "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
 * }
 *
 * // Example response:
 * {
 *   "message": "Authentication successful",
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
 *   "user": {
 *     "id": "68fbb559f00d95422dcc726d",
 *     "email": "example@metropolia.fi",
 *     "user_level_name": "Admin"
 *   }
 * }
 */
const verifyGoogleToken = async (
  req: Request<{}, {}, { idToken: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('verifyGoogleToken called with body:', req.body);

    if (!GOOGLE_CLIENT_ID) {
      console.error('Google client ID not set in environment variables');
      next(new CustomError('Google client ID not set', 500));
      return;
    }

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
      googleId: payload.sub || '',
      email: payload.email || '',
      name: payload.name || '',
    };

    const user = await findOrCreateUser(googleResponse);

    const tokenContent: TokenContent = {
      id: user.id,
      user_level_id: user.user_level_id,
    };

    const token = jwt.sign(tokenContent, JWT_SECRET, { expiresIn: '3h' });

    res.json({
      message: 'Authentication successful',
      token,
      user,
    });
  } catch (error) {
    console.error('Error in verifyGoogleToken:', error);
    next(new CustomError('Failed to verify token', 500));
  }
};

export { verifyGoogleToken };
