import { OAuth2Client } from "google-auth-library";
import { Request, Response, NextFunction } from "express";
import { MessageResponse } from "../../types/MessageTypes";
import CustomError from "../../classes/CustomError";

const client = new OAuth2Client();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

type GoogleResponse = {
  googleId: string;
  email: string;
  name: string;
  picture: string;
};

const verifyGoogleToken = async (
  req: Request<{}, {}, { idToken: string }>,
  res: Response<GoogleResponse | MessageResponse>,
  next: NextFunction
) => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      next(new CustomError("Google client ID not set", 500));
      return;
    }

    if (!req.body.idToken) {
      next(new CustomError("Token not provided", 400));
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: req.body.idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      next(new CustomError("Invalid token payload", 400));
      return;
    }

    const googleResponse: GoogleResponse = {
      googleId: payload.sub || "", // payload.sub id does not change so it can be used as database identifier
      email: payload.email || "",
      name: payload.name || "",
      picture: payload.picture || "",
    };

    res.status(200).json(googleResponse);
  } catch (error) {
    console.log(error);
    next(new CustomError("Failed to verify token", 500));
  }
}

export { verifyGoogleToken };
