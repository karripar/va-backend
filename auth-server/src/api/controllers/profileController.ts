import { Request, Response, NextFunction } from "express";
import {
  ProfileResponse,
  Document,
  ExtendedApplicationPhaseData as ApplicationPhaseData,
  ExtendedApplicationsResponse as ApplicationsResponse,
  ExtendedApplicationDocument as ApplicationDocument
} from "va-hybrid-types/contentTypes";
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

//----> Profile data demonstration (mock data):
const profiles: ProfileResponse[] = [
  {
    id: "1",
    userName: "Test User",
    email: "test@metropolia.fi",
    registeredAt: new Date().toISOString(),
    avatarUrl: "", // "https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser&mouth=default&eyes=default"
    favorites: ["Espanja - Madrid", "Ranska - Pariisi"],
    documents: [],
    exchangeBadge: true,
    linkedinUrl: "https://linkedin.com/in/testuser",
  }
];


const applications: ApplicationsResponse[] = [];


const requiredDocuments = {
  esihaku: [
    { type: 'transcript', name: 'Opintosuoritusote' },
    { type: 'motivation_letter', name: 'Motivaatiokirje' },
    { type: 'language_certificate', name: 'Kielitodistus' }
  ],
  nomination: [
    { type: 'nomination_form', name: 'Nomination-lomake' },
    { type: 'learning_agreement', name: 'Learning Agreement' }
  ],
  apurahat: [
    { type: 'grant_application', name: 'Apurahakehakemus' },
    { type: 'budget_plan', name: 'Budjettisuunnitelma' }
  ],
  vaihdon_jalkeen: [
    { type: 'final_report', name: 'Loppuraportti' },
    { type: 'transcript_abroad', name: 'Ulkomainen opintosuoritusote' }
  ]
};

// ===== HELPER FUNCTIONS =====
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getUserFromRequest = (req: Request): string => {
  // TODO: Extract from JWT token when authentication is implemented
  return "1"; // Mock user ID for now
};

const validateRequiredFields = (data: unknown, requiredFields: string[]): string[] => {
  const missing: string[] = [];
  if (typeof data !== 'object' || data === null) {
    return requiredFields;
  }

  const dataObj = data as Record<string, unknown>;
  requiredFields.forEach(field => {
    if (!dataObj[field] || dataObj[field] === '') {
      missing.push(field);
    }
  });
  return missing;
};

// ===== PROFILE FUNCTIONS =====

const createProfile = (req: Request, res: Response) => {
  try {
    const requiredFields = ['userName', 'email'];
    const missing = validateRequiredFields(req.body, requiredFields);

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields: missing
      });
    }

    const newProfile: ProfileResponse = {
      id: String(profiles.length + 1),
      userName: req.body.userName,
      email: req.body.email,
      registeredAt: new Date().toISOString(),
      avatarUrl: req.body.avatarUrl ?? "",
      favorites: [],
      documents: [],
      exchangeBadge: false,
      linkedinUrl: req.body.linkedinUrl ?? "",
    };

    profiles.push(newProfile);
    res.status(201).json(newProfile);
  } catch {
  res.status(500).json({ error: 'Failed to create profile' });
  }
};

const getProfilePage = (req: Request, res: Response) => {
  try {
    const profile = profiles.find((p) => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch {
  res.status(500).json({ error: 'Failed to create profile' });
  }
};

const getProfile = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const profile = profiles.find(p => p.id === userId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const updateProfile = (req: Request, res: Response) => {
  try {
    const index = profiles.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Profile not found" });
    }


    if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    profiles[index] = { ...profiles[index], ...req.body };
    res.json(profiles[index]);

  } catch {
  res.status(500).json({ error: 'Failed to create profile' });
  }
};

const addFavorite = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination } = req.body;

    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }

    const profile = profiles.find(p => p.id === userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (!profile.favorites.includes(destination)) {
      profile.favorites.push(destination);
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const removeFavorite = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination } = req.body;

    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }

    const profile = profiles.find(p => p.id === userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    profile.favorites = profile.favorites.filter((fav: string) => fav !== destination);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const addDocument = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: "Name and URL are required" });
    }

    const profile = profiles.find(p => p.id === userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const newDoc: Document = {
      id: Date.now().toString(),
      name,
      url,
      uploadedAt: new Date().toISOString(),
    };

    profile.documents.push(newDoc);
    res.json(newDoc);
  } catch (error) {
    next(error);
  }
};

const removeDocument = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { docId } = req.params;

    const profile = profiles.find(p => p.id === userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const initialLength = profile.documents.length;
    profile.documents = profile.documents.filter((doc: Document) => doc.id !== docId);

    if (profile.documents.length === initialLength) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json({ message: "Document removed successfully" });
  } catch (error) {
    next(error);
  }
};

// ===== APPLICATION FUNCTIONS =====

const getApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const userApplications = applications.find(app => app.userId === userId);

    if (!userApplications) {
      return res.json({
        userId,
        applications: [],
        currentPhase: null,
      });
    }

    res.json(userApplications);
  } catch (error) {
    next(error);
  }
};

const createApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase, data } = req.body;

    if (!phase || !data) {
      return res.status(400).json({ error: "Phase and data are required" });
    }

    let userApp = applications.find(app => app.userId === userId);

    if (userApp) {
      const existingPhase = userApp.applications.find((app: ApplicationPhaseData) => app.phase === phase);
      if (existingPhase) {
        return res.status(400).json({ error: "Application phase already exists" });
      }

      userApp.applications.push({
        phase,
        data,
        documents: [],
        submittedAt: null,
        status: "draft",
      });
    } else {
      userApp = {
        userId,
        applications: [
          {
            phase,
            data,
            documents: [],
            submittedAt: null,
            status: "draft",
          },
        ],
        currentPhase: phase,
      };
      applications.push(userApp);
    }

    res.status(201).json(userApp);
  } catch (error) {
    next(error);
  }
};

const updateApplicationPhase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase } = req.params;
    const data = req.body;

    const userApp = applications.find(app => app.userId === userId);

    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const phaseIndex = userApp.applications.findIndex((app: ApplicationPhaseData) => app.phase === phase);

    if (phaseIndex === -1) {
      userApp.applications.push({
        phase,
        data,
        documents: [],
        submittedAt: null,
        status: "draft",
      });
    } else {

      userApp.applications[phaseIndex] = {
        ...userApp.applications[phaseIndex],
        data: { ...(userApp.applications[phaseIndex].data as Record<string, unknown>), ...data },
      };
    }

    userApp.currentPhase = phase;
    res.json(userApp);
  } catch (error) {
    next(error);
  }
};

const getApplicationDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase } = req.params;

    const userApp = applications.find(app => app.userId === userId);

    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const phaseApp = userApp.applications.find((app: ApplicationPhaseData) => app.phase === phase);

    if (!phaseApp) {
      return res.status(404).json({ error: "Phase not found" });
    }

    res.json(phaseApp.documents);
  } catch (error) {
    next(error);
  }
};

const uploadApplicationDocument = upload.single('file');

const addApplicationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase, documentType, fileName, fileUrl, fileSize, mimeType } = req.body;

    if (!phase || !documentType) {
      return res.status(400).json({ error: "Phase and document type are required" });
    }

    const userApp = applications.find(app => app.userId === userId);

    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const phaseApp = userApp.applications.find((app: ApplicationPhaseData) => app.phase === phase);

    if (!phaseApp) {
      return res.status(404).json({ error: "Phase not found" });
    }

    const existingDoc = phaseApp.documents.find((doc: ApplicationDocument) => doc.documentType === documentType);
    if (existingDoc) {
      return res.status(400).json({ error: "Document type already uploaded for this phase" });
    }

    const newDocument: ApplicationDocument = {
      id: Date.now().toString(),
      applicationId: `app-${userId}-${Date.now()}`,
      applicationPhase: phase,
      documentType,
      fileName: fileName || `document-${Date.now()}.ext`,
      fileUrl: fileUrl || `/uploads/documents/${fileName}`,
      fileSize: fileSize || 0,
      mimeType: mimeType || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
      isRequired: false,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    phaseApp.documents.push(newDocument as any as ApplicationDocument);
    res.status(201).json(newDocument);
  } catch (error) {
    next(error);
  }
};

const removeApplicationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { documentId } = req.params;

    const userApp = applications.find(app => app.userId === userId);

    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    let documentFound = false;

    for (const phaseApp of userApp.applications) {
      const docIndex = phaseApp.documents.findIndex((doc: ApplicationDocument) => doc.id === documentId);

      if (docIndex !== -1) {
        phaseApp.documents.splice(docIndex, 1);
        documentFound = true;
        break;
      }
    }

    if (!documentFound) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const submitApplicationPhase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase } = req.params;

    const userApp = applications.find(app => app.userId === userId);

    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const phaseApp = userApp.applications.find((app: ApplicationPhaseData) => app.phase === phase);

    if (!phaseApp) {
      return res.status(404).json({ error: "Phase not found" });
    }


    const phaseRequiredDocs = requiredDocuments[phase as keyof typeof requiredDocuments] || [];
    const uploadedDocTypes = phaseApp.documents.map((doc: ApplicationDocument) => doc.documentType);
    const missingDocs = phaseRequiredDocs.filter(
      required => !uploadedDocTypes.includes(required.type)
    );

    if (missingDocs.length > 0) {
      return res.status(400).json({
        error: "Missing required documents",
        missingDocuments: missingDocs.map(doc => doc.name)
      });
    }

    phaseApp.submittedAt = new Date().toISOString();
    phaseApp.status = "submitted";

    // TODO: Send notification emails
    console.log(`Application phase ${phase} submitted for user ${userId}`);

    res.json(userApp);
  } catch (error) {
    next(error);
  }
};

// Admin function for approving applications
const approveApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reviewNotes, phase } = req.body;
    const reviewerId = getUserFromRequest(req);

    if (!phase) {
      return res.status(400).json({ error: "Phase is required" });
    }

    const userApp = applications.find(app => app.userId === id);

    if (!userApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    const phaseApp = userApp.applications.find((app: ApplicationPhaseData) => app.phase === phase);

    if (!phaseApp) {
      return res.status(404).json({ error: "Phase not found" });
    }

    phaseApp.status = "approved";
    phaseApp.reviewedBy = reviewerId;
    phaseApp.reviewNotes = reviewNotes;
    phaseApp.reviewedAt = new Date().toISOString();

    console.log(`Application phase ${phase} approved for user ${id}`);

    res.json(userApp);
  } catch (error) {
    next(error);
  }
};


const getRequiredDocuments = (req: Request, res: Response) => {
  try {
    const { phase } = req.params;
    const docs = requiredDocuments[phase as keyof typeof requiredDocuments];

    if (!docs) {
      return res.status(404).json({ error: "Phase not found" });
    }

    res.json(docs);
  } catch {
  res.status(500).json({ error: 'Failed to create profile' });
  }
};

export {
  getProfilePage,
  updateProfile,
  createProfile,
  getProfile,
  addFavorite,
  removeFavorite,
  addDocument,
  removeDocument,
  getApplications,
  createApplication,
  updateApplicationPhase,
  getApplicationDocuments,
  addApplicationDocument,
  removeApplicationDocument,
  submitApplicationPhase,
  approveApplication,
  getRequiredDocuments,
  uploadApplicationDocument,
};
