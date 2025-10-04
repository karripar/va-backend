import { Request, Response } from "express";
import { ProfileResponse } from "va-hybrid-types/contentTypes";

//----> Profiili data demonstrationnin luonti (mock data):
let profiles: ProfileResponse[] = [
  {
    id: "1",
    userName: "Test User",
    email: "test@metropolia.fi",
    registeredAt: new Date().toISOString(),
    avatarUrl: "/default-avatar.png",
    favorites: ["Espanja - Madrid", "Ranska - Pariisi"],
    documents: ["learning-agreement.pdf"],
    exchangeBadge: true,
    linkedinUrl: "https://linkedin.com/in/testuser",
  }
];

// --> Profiilisivun luonnin logiikka:

const createProfile = (req: Request, res: Response) => {
  const newProfile: ProfileResponse = {
    id: String(profiles.length + 1),
    userName: req.body.userName,
    email: req.body.email,
    registeredAt: new Date().toISOString(),
    avatarUrl: req.body.avatarUrl ?? "",
    favorites: [],
    documents: [],
    exchangeBadge: true,
    linkedinUrl: req.body.linkedinUrl ?? "",
  };
  profiles.push(newProfile);
  res.status(201).json(newProfile);
};

// ----> Profiilin haku id:llä logiikka:
const getProfileSearch = (req: Request, res: Response) => {
  const profile = profiles.find((p) => p.id === req.params.id);
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json(profile);
};

const getProfilePage = (req: Request, res: Response) => {
  const profile = profiles.find((p) => p.id === req.params.id);
  if (!profile) return res.status(404).json({ error: "Profile not found" });
  res.json(profile);
};

// ----> Kaikkien profiilien haku logiikka tai nykyisen käyttäjän profiilin haku:
const getAllProfiles = (req: Request, res: Response) => {
  // Return first profile as the current user's profile (for now)
  // In a real app, this would get the profile based on the authenticated user
  if (profiles.length === 0) {
    return res.status(404).json({ error: "No profile found" });
  }
  res.json(profiles[0]); // Return single profile object, not array
};

// ----> Profiilisivun päivityksen logiikka:

const updateProfile = (req: Request, res: Response) => {
  const index = profiles.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Profile not found" });
  }

  profiles[index] = { ...profiles[index], ...req.body };
  res.json(profiles[index]);
};

export { getProfilePage, updateProfile, createProfile, getProfileSearch, getAllProfiles };
