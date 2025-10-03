import { OAuth2Client } from "google-auth-library";
import { Request, Response, NextFunction } from "express";
import { MessageResponse } from "../../types/MessageTypes";
import { ProfileResponse } from "va-hybrid-types/contentTypes";
import CustomError from "../../classes/CustomError";

const client = new OAuth2Client();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

type GoogleResponse = {
  googleId: string;
  email: string;
  name: string;
  picture: string;
};

// Mock-data (MongoDB integroidaan myöhemmin)
let profiles: ProfileResponse[] = [
  {
    id: "1",
    userName: "Test User",
    email: "test@metropolia.fi",
    registeredAt: new Date().toISOString(),
    favorites: ["Espanja - Madrid"],
    documents: ["agreement.pdf"],
    exchangeBadge: true,
    avatarUrl: "/default-avatar.png",
    linkedinUrl: "https://linkedin.com/in/testuser"
  }
];

export const getProfile = (req: Request, res: Response) => {
  const profile = profiles.find(p => p.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  res.json(profile);
};

export const createProfile = (req: Request, res: Response) => {
  const newProfile: ProfileResponse = {
    id: String(profiles.length + 1),
    userName: req.body.userName,
    email: req.body.email,
    registeredAt: new Date().toISOString(),
    favorites: [],
    documents: [],
    exchangeBadge: false,
    avatarUrl: req.body.avatarUrl ?? "",
    linkedinUrl: req.body.linkedinUrl ?? ""
  };
  profiles.push(newProfile);
  res.status(201).json(newProfile);
};

export const updateProfile = (req: Request, res: Response) => {
  const index = profiles.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Profile not found" });
  }
  profiles[index] = { ...profiles[index], ...req.body };
  res.json(profiles[index]);
};