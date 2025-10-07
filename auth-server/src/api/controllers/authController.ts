import { OAuth2Client } from "google-auth-library";
import { Request, Response, NextFunction } from "express";
import { MessageResponse } from "../../types/MessageTypes";
import CustomError from "../../classes/CustomError";
import { findOrCreateUser } from "./userController";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

type GoogleResponse = {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
};

const verifyGoogleToken = async (
  req: Request<{}, {}, { idToken: string }>,
  res: Response<GoogleResponse | MessageResponse>,
  next: NextFunction
) => {
  try {
    console.log("Google Client ID:", GOOGLE_CLIENT_ID ? "✓ Set" : "✗ Missing");
    console.log("Request body:", req.body);

    if (!GOOGLE_CLIENT_ID) {
      console.error("Google client ID not set in environment variables");
      next(new CustomError("Google client ID not set", 500));
      return;
    }

    if (!req.body.idToken) {
      console.error("No idToken provided in request");
      next(new CustomError("Token not provided", 400));
      return;
    }

    console.log("Attempting to verify token with Google...");
    const ticket = await client.verifyIdToken({
      idToken: req.body.idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("Google verification successful, payload received");

    if (!payload) {
      console.error("No payload received from Google");
      next(new CustomError("Invalid token payload", 400));
      return;
    }

    const googleResponse: GoogleResponse = {
      googleId: payload.sub || "", // payload.sub id does not change so it can be used as database identifier
      email: payload.email || "",
      name: payload.name || "",
      picture: payload.picture,
    };

    // find or add a new user in database
    await findOrCreateUser(googleResponse);

    console.log("Sending successful response:", { email: googleResponse.email, name: googleResponse.name });
    res.status(200).json(googleResponse);
  } catch (error) {
    console.error("Error in verifyGoogleToken:", error);
    next(new CustomError("Failed to verify token", 500));
  }
}

export { verifyGoogleToken };
