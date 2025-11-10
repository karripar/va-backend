import {Request, Response, NextFunction} from 'express';
import {ProfileResponse, Document} from 'va-hybrid-types/contentTypes';

//----> Profiili data demonstrationnin luonti (mock data):
const profiles: ProfileResponse[] = [
  {
    id: '1',
    userName: 'Test User',
    email: 'test@metropolia.fi',
    registeredAt: new Date().toISOString(),
    user_level_id: 1,
    avatarUrl: '', // "https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser&mouth=default&eyes=default"
    favorites: ['Espanja - Madrid', 'Ranska - Pariisi'],
    documents: [],
    exchangeBadge: true,
    linkedinUrl: 'https://linkedin.com/in/testuser',
  },
];

// --> Profiilisivun luonnin logiikka:
const createProfile = (req: Request, res: Response) => {
  const newProfile: ProfileResponse = {
    id: String(profiles.length + 1),
    userName: req.body.userName,
    email: req.body.email,
    registeredAt: new Date().toISOString(),
    user_level_id: 1,
    avatarUrl: req.body.avatarUrl ?? '',
    favorites: [],
    documents: [],
    exchangeBadge: true,
    linkedinUrl: req.body.linkedinUrl ?? '',
  };
  profiles.push(newProfile);
  res.status(201).json(newProfile);
};

const getProfilePage = (req: Request, res: Response) => {
  const profile = profiles.find((p) => p.id === req.params.id);
  if (!profile) return res.status(404).json({error: 'Profile not found'});
  res.json(profile);
};

const getProfile = (req: Request, res: Response, next: NextFunction) => {
  try {
    //  Get userId from req.user when authentication is added

    if (profiles.length === 0) {
      return res.status(404).json({message: 'No profile found'});
    }
    res.json(profiles[0]);
  } catch (error) {
    next(error);
  }
};

// ----> Profiilisivun päivityksen logiikka:

const updateProfile = (req: Request, res: Response) => {
  const index = profiles.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({error: 'Profile not found'});
  }

  profiles[index] = {...profiles[index], ...req.body};
  res.json(profiles[index]);
};

const addFavorite = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get userId from req.user when authentication is added
    const {destination} = req.body;

    if (profiles.length === 0) {
      return res.status(404).json({error: 'Profile not found'});
    }

    if (!profiles[0].favorites.includes(destination)) {
      profiles[0].favorites.push(destination);
    }

    res.json(profiles[0]);
  } catch (error) {
    next(error);
  }
};

const removeFavorite = (req: Request, res: Response, next: NextFunction) => {
  try {
    // userId from req.user when authentication is added
    const {destination} = req.body;

    if (profiles.length === 0) {
      return res.status(404).json({error: 'Profile not found'});
    }

    profiles[0].favorites = profiles[0].favorites.filter(
      (fav: string) => fav !== destination,
    );

    res.json(profiles[0]);
  } catch (error) {
    next(error);
  }
};

/*
const addDocument = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, url } = req.body;

    if (profiles.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      name,
      url,
      uploadedAt: new Date().toISOString(),
    };

    profiles[0].documents.push(newDoc);

    res.json(newDoc);
  } catch (error) {
    next(error);
  }
};

*/
const removeDocument = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { docId } = req.params;

    if (profiles.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    profiles[0].documents = profiles[0].documents.filter(
      (doc: Document) => doc.id !== docId
    );

    res.json({ message: "Document removed" });
  } catch (error) {
    next(error);
  }
};
export {
  getProfilePage,
  updateProfile,
  createProfile,
  getProfile,
  addFavorite,
  removeFavorite,
  //addDocument,
  removeDocument,
};
