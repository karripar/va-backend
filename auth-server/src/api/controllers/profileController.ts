import { Request, Response, NextFunction } from "express";
import {
  ProfileResponse,
  Document,
  ExtendedApplicationPhaseData as ApplicationPhaseData,
  ExtendedApplicationsResponse as ApplicationsResponse,
  ExtendedApplicationDocument as ApplicationDocument,
} from "va-hybrid-types/contentTypes";

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

// Grant and Budget Management mock data stores
const budgetEstimates: Record<string, unknown[]> = {};
const grantApplications: Record<string, unknown[]> = {};
const erasmusGrants: Record<string, unknown[]> = {};
const kelaSupport: Record<string, unknown> = {};

// Budget categories definition
const budgetCategories = [
  {
    category: "matkakulut",
    title: "Matkakulut",
    description: "Lennot, junat, bussit, kimppakyytit, viisumi",
    icon: "plane",
    items: ["Lennot", "Junat", "Bussit", "Kimppakyytit", "Viisumi"]
  },
  {
    category: "vakuutukset",
    title: "Vakuutukset",
    description: "Matka- ja opiskelija­vakuutukset",
    icon: "shield",
    items: ["Matkavakuutus", "Opiskelija­vakuutus"]
  },
  {
    category: "asuminen",
    title: "Asuminen",
    description: "Vuokra ja -vakuus, muut asuntoon liittyvät laskut",
    icon: "home",
    items: ["Vuokra", "Vakuus", "Sähkölasku", "Internetlasku"]
  },
  {
    category: "ruoka_ja_arki",
    title: "Ruoka ja arki",
    description: "Kaupat ja ravintolat, hygieniä",
    icon: "shopping-cart",
    items: ["Ruokaostokset", "Ravintolat", "Hygieniä"]
  },
  {
    category: "opintovalineet",
    title: "Opintovalineet",
    description: "Kirjat, materiaalit, tietokone",
    icon: "pencil",
    items: ["Kirjat", "Materiaalit", "Tietokone"]
  }
];

// Erasmus+ grant types definition
const erasmusGrantTypes = [
  {
    type: "base_grant",
    title: "Erasmus+ apuraha",
    description: "Hae Erasmus+ -apurahaa vaihtoon",
    status: "not_started",
    estimatedAmount: 0,
    requiredDocuments: [
      "Erasmus+ Grant Agreement",
      "Learning Agreement"
    ]
  },
  {
    type: "travel_grant",
    title: "Erasmus+ matkatuki",
    description: "Matkakulutuki etäisyyden perusteella",
    status: "not_started",
    estimatedAmount: 0
  },
  {
    type: "green_travel_supplement",
    title: "Vihreän matkustamisen tuki",
    description: "Lisätuki ympäristöystävällisestä matkustamisesta",
    status: "not_started",
    estimatedAmount: 0
  },
  {
    type: "inclusion_support",
    title: "Osallisuustuki",
    description: "Tuki erityistarpeita varten",
    status: "not_started",
    estimatedAmount: 0
  }
];


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
    const { name, url, sourceType, notes } = req.body;

    if (!name || !url || !sourceType) {
      return res.status(400).json({ error: "Name, URL, and sourceType are required" });
    }

    // Validate source type
    const validSourceTypes = ["google_drive", "onedrive", "dropbox", "icloud", "other_url"];
    if (!validSourceTypes.includes(sourceType)) {
      return res.status(400).json({ error: "Invalid source type" });
    }

    const profile = profiles.find(p => p.id === userId);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const newDoc = {
      id: Date.now().toString(),
      name,
      url,
      sourceType,
      addedAt: new Date().toISOString(),
      isAccessible: true,
      accessPermission: "public"
    } as unknown as Document;

    if (notes) {
      (newDoc as Record<string, unknown>).notes = notes;
    }

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

const addApplicationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase, documentType, fileName, fileUrl, sourceType, notes } = req.body;

    if (!phase || !documentType || !fileUrl || !sourceType) {
      return res.status(400).json({ error: "Phase, document type, file URL, and source type are required" });
    }

    // Validate source type
    const validSourceTypes = ["google_drive", "onedrive", "dropbox", "icloud", "other_url"];
    if (!validSourceTypes.includes(sourceType)) {
      return res.status(400).json({ error: "Invalid source type" });
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

    const newDocument = {
      id: Date.now().toString(),
      applicationId: `app-${userId}-${Date.now()}`,
      applicationPhase: phase,
      documentType,
      fileName: fileName || `document-${Date.now()}.ext`,
      fileUrl,
      sourceType,
      addedAt: new Date().toISOString(),
      addedBy: userId,
      isAccessible: true,
      accessPermission: "public",
      isRequired: false,
    } as unknown as ApplicationDocument;

    if (notes) {
      (newDocument as Record<string, unknown>).notes = notes;
    }

    phaseApp.documents.push(newDocument);
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

// ===== BUDGET MANAGEMENT FUNCTIONS =====

const getBudgetCategories = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ categories: budgetCategories });
  } catch (error) {
    next(error);
  }
};

const createOrUpdateBudgetEstimate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination, categories, currency } = req.body;

    if (!destination || !categories || !currency) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "destination, categories, and currency are required"
      });
    }

    // Calculate total estimate
    let totalEstimate = 0;
    for (const category in categories) {
      if (categories[category].estimatedCost) {
        totalEstimate += categories[category].estimatedCost;
      }
    }

    const budgetEstimate = {
      id: `est_${Date.now()}`,
      userId,
      destination,
      categories,
      totalEstimate,
      currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!budgetEstimates[userId]) {
      budgetEstimates[userId] = [];
    }

    // Check if estimate for destination exists
    const existingIndex = (budgetEstimates[userId] as Array<Record<string, unknown>>).findIndex(
      (est: Record<string, unknown>) => est.destination === destination
    );

    if (existingIndex !== -1) {
      (budgetEstimates[userId] as Array<Record<string, unknown>>)[existingIndex] = budgetEstimate;
    } else {
      (budgetEstimates[userId] as Array<Record<string, unknown>>).push(budgetEstimate);
    }

    res.json(budgetEstimate);
  } catch (error) {
    next(error);
  }
};

const getBudgetEstimate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination } = req.query;

    if (!budgetEstimates[userId]) {
      return res.json([]);
    }

    let estimates = budgetEstimates[userId] as Array<Record<string, unknown>>;

    if (destination) {
      estimates = estimates.filter((est: Record<string, unknown>) => est.destination === destination);
    }

    res.json(estimates.length === 1 ? estimates[0] : estimates);
  } catch (error) {
    next(error);
  }
};

// ===== ERASMUS+ GRANT FUNCTIONS =====

const getErasmusGrantTypes = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ grantTypes: erasmusGrantTypes });
  } catch (error) {
    next(error);
  }
};

const applyForErasmusGrant = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { grantType, destination, program, estimatedAmount } = req.body;

    if (!grantType || !destination || !program) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "grantType, destination, and program are required"
      });
    }

    const grantTypeInfo = erasmusGrantTypes.find(gt => gt.type === grantType);
    if (!grantTypeInfo) {
      return res.status(400).json({ error: "Invalid grant type" });
    }

    const newGrant = {
      id: `erasmus_${Date.now()}`,
      userId,
      grantType,
      title: grantTypeInfo.title,
      description: grantTypeInfo.description,
      status: "in_progress",
      estimatedAmount: estimatedAmount || 0,
      documents: [],
      destination,
      program,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!erasmusGrants[userId]) {
      erasmusGrants[userId] = [];
    }

    (erasmusGrants[userId] as Array<Record<string, unknown>>).push(newGrant);
    res.status(201).json(newGrant);
  } catch (error) {
    next(error);
  }
};

const updateErasmusGrant = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { grantId } = req.params;
    const updates = req.body;

    if (!erasmusGrants[userId]) {
      return res.status(404).json({ error: "No grants found" });
    }

    const grantIndex = (erasmusGrants[userId] as Array<Record<string, unknown>>).findIndex(
      (grant: Record<string, unknown>) => grant.id === grantId
    );

    if (grantIndex === -1) {
      return res.status(404).json({ error: "Grant not found" });
    }

    (erasmusGrants[userId] as Array<Record<string, unknown>>)[grantIndex] = {
      ...(erasmusGrants[userId] as Array<Record<string, unknown>>)[grantIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json((erasmusGrants[userId] as Array<Record<string, unknown>>)[grantIndex]);
  } catch (error) {
    next(error);
  }
};

const getUserErasmusGrants = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const grants = erasmusGrants[userId] || [];
    res.json({ grants });
  } catch (error) {
    next(error);
  }
};

// ===== KELA SUPPORT FUNCTIONS =====

const applyForKelaSupport = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination, monthlyAmount, duration, studyAbroadConfirmation } = req.body;

    if (!destination || !monthlyAmount || !duration || studyAbroadConfirmation === undefined) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "destination, monthlyAmount, duration, and studyAbroadConfirmation are required"
      });
    }

    const totalAmount = monthlyAmount * duration;

    const kelaApplication = {
      id: `kela_${Date.now()}`,
      userId,
      status: "in_progress",
      monthlyAmount,
      duration,
      totalAmount,
      studyAbroadConfirmation,
      applicationSubmitted: false,
      documents: [],
      destination,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    kelaSupport[userId] = kelaApplication;
    res.status(201).json(kelaApplication);
  } catch (error) {
    next(error);
  }
};

const updateKelaSupport = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { kelaId } = req.params;
    const updates = req.body;

    if (!kelaSupport[userId] || (kelaSupport[userId] as Record<string, unknown>).id !== kelaId) {
      return res.status(404).json({ error: "Kela support application not found" });
    }

    kelaSupport[userId] = {
      ...(kelaSupport[userId] as Record<string, unknown>),
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json(kelaSupport[userId]);
  } catch (error) {
    next(error);
  }
};

const getKelaSupport = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const support = kelaSupport[userId] || null;
    res.json(support);
  } catch (error) {
    next(error);
  }
};

// ===== GRANT CALCULATOR =====

const calculateTotalGrants = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { destination, program, baseAmount, travelDistance, greenTravel, inclusionSupport, currency } = req.body;

    if (!destination || !program || baseAmount === undefined || !currency) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "destination, program, baseAmount, and currency are required"
      });
    }

    const breakdown: Record<string, number> = {
      baseGrant: baseAmount
    };

    // Calculate travel grant based on distance
    if (travelDistance) {
      if (travelDistance >= 2000) {
        breakdown.travelGrant = 275;
      } else if (travelDistance >= 1000) {
        breakdown.travelGrant = 180;
      } else if (travelDistance >= 500) {
        breakdown.travelGrant = 180;
      } else {
        breakdown.travelGrant = 23;
      }
    } else {
      breakdown.travelGrant = 0;
    }

    // Green travel supplement
    breakdown.greenTravelSupplement = greenTravel ? 50 : 0;

    // Inclusion support (varies, using example amount)
    breakdown.inclusionSupport = inclusionSupport ? 250 : 0;

    const totalEstimated = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    res.json({
      destination,
      program,
      breakdown,
      totalEstimated,
      currency
    });
  } catch (error) {
    next(error);
  }
};

// ===== GRANT SEARCH =====

const searchGrants = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { destination, program, minAmount, maxAmount } = req.query;

    let results: Array<Record<string, unknown>> = [];

    // Search in all grant applications
    if (grantApplications[userId]) {
      results = [...(grantApplications[userId] as Array<Record<string, unknown>>)];
    }

    // Add Erasmus grants
    if (erasmusGrants[userId]) {
      results = [...results, ...(erasmusGrants[userId] as Array<Record<string, unknown>>)];
    }

    // Apply filters
    if (destination) {
      results = results.filter((grant: Record<string, unknown>) => grant.destination === destination);
    }

    if (program) {
      results = results.filter((grant: Record<string, unknown>) => grant.program === program);
    }

    if (minAmount) {
      results = results.filter((grant: Record<string, unknown>) =>
        (grant.estimatedAmount as number || 0) >= Number(minAmount)
      );
    }

    if (maxAmount) {
      results = results.filter((grant: Record<string, unknown>) =>
        (grant.estimatedAmount as number || 0) <= Number(maxAmount)
      );
    }

    res.json({
      results,
      total: results.length
    });
  } catch (error) {
    next(error);
  }
};

// ===== ALL GRANTS SUMMARY =====

const getAllGrantsSummary = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);

    const grants = grantApplications[userId] || [];
    const erasmus = erasmusGrants[userId] || [];
    const kela = kelaSupport[userId] || null;
    const budget = budgetEstimates[userId] ? (budgetEstimates[userId] as Array<Record<string, unknown>>)[0] : null;

    // Calculate total estimated support
    let totalEstimatedSupport = 0;

    (grants as Array<Record<string, unknown>>).forEach((grant: Record<string, unknown>) => {
      totalEstimatedSupport += (grant.estimatedAmount as number || 0);
    });

    (erasmus as Array<Record<string, unknown>>).forEach((grant: Record<string, unknown>) => {
      totalEstimatedSupport += (grant.estimatedAmount as number || 0);
    });

    if (kela) {
      totalEstimatedSupport += ((kela as Record<string, unknown>).totalAmount as number || 0);
    }

    res.json({
      grants,
      erasmusGrants: erasmus,
      kelaSupport: kela,
      budgetEstimate: budget,
      totalEstimatedSupport
    });
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
  // Budget Management
  getBudgetCategories,
  createOrUpdateBudgetEstimate,
  getBudgetEstimate,
  // Erasmus+ Grants
  getErasmusGrantTypes,
  applyForErasmusGrant,
  updateErasmusGrant,
  getUserErasmusGrants,
  // Kela Support
  applyForKelaSupport,
  updateKelaSupport,
  getKelaSupport,
  // Grant Calculator & Search
  calculateTotalGrants,
  searchGrants,
  getAllGrantsSummary,
};
