import {Request, Response, NextFunction} from 'express';
import multer from 'multer';
import path from 'path';
import {v4 as uuidv4} from 'uuid';

// ===== MULTER CONFIGURATION (Legacy file upload support) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {fileSize: 10 * 1024 * 1024}, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getUserFromRequest = (req: Request): string => {
  // TODO: Extract from JWT token when authentication is implemented
  return "1"; // Mock user ID for now
};

const validateSourceType = (sourceType: string): boolean => {
  const validSourceTypes = ["google_drive", "onedrive", "dropbox", "icloud", "other_url"];
  return validSourceTypes.includes(sourceType);
};

// ===== LEGACY FILE UPLOAD ENDPOINTS (Backward compatibility) =====
const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({message: 'No file uploaded'});
    }

    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    res.json({url: fileUrl});
  } catch (error) {
    next(error);
  }
};

const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({message: 'No file uploaded'});
    }

    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    res.json({url: fileUrl, name: req.file.originalname});
  } catch (error) {
    next(error);
  }
};

const uploadApplicationDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({message: 'No file uploaded'});
    }

    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

    res.json({
      fileUrl,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    next(error);
  }
};


const addDocumentLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { name, url, sourceType, notes } = req.body;

    if (!name || !url || !sourceType) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "name, url, and sourceType are required"
      });
    }

    if (!validateSourceType(sourceType)) {
      return res.status(400).json({
        error: "Invalid source type",
        validTypes: ["google_drive", "onedrive", "dropbox", "icloud", "other_url"]
      });
    }

    const documentLink = {
      id: uuidv4(),
      userId,
      name,
      url,
      sourceType,
      addedAt: new Date().toISOString(),
      isAccessible: true,
      accessPermission: "public",
      notes: notes || null
    };

    // TODO: Saving to database
    res.status(201).json(documentLink);
  } catch (error) {
    next(error);
  }
};


const addApplicationDocumentLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const { phase, documentType, fileName, fileUrl, sourceType, notes } = req.body;

    if (!phase || !documentType || !fileUrl || !sourceType) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "phase, documentType, fileUrl, and sourceType are required"
      });
    }

    if (!validateSourceType(sourceType)) {
      return res.status(400).json({
        error: "Invalid source type",
        validTypes: ["google_drive", "onedrive", "dropbox", "icloud", "other_url"]
      });
    }

    const applicationDocumentLink = {
      id: uuidv4(),
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
      notes: notes || null
    };

    // TODO: Saving to database
    res.status(201).json(applicationDocumentLink);
  } catch (error) {
    next(error);
  }
};

const validateDocumentLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, sourceType } = req.body;

    if (!url || !sourceType) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "url and sourceType are required"
      });
    }

    if (!validateSourceType(sourceType)) {
      return res.status(400).json({
        error: "Invalid source type",
        validTypes: ["google_drive", "onedrive", "dropbox", "icloud", "other_url"]
      });
    }

    // URL validating for different platforms
    const platformPatterns: Record<string, RegExp> = {
      google_drive: /drive\.google\.com\/(file\/d\/|open\?id=)/,
      onedrive: /1drv\.ms\/|onedrive\.live\.com/,
      dropbox: /dropbox\.com\//,
      icloud: /icloud\.com/,
      other_url: /^https?:\/\/.+/
    };

    const pattern = platformPatterns[sourceType];
    const isValidFormat = pattern ? pattern.test(url) : false;

    // TODO: Implementing actual link accessibility check
    const validation = {
      isValid: isValidFormat,
      isAccessible: isValidFormat,
      errorMessage: isValidFormat ? null : "URL format does not match expected pattern for platform",
      checkedAt: new Date().toISOString(),
      platform: sourceType
    };

    res.json(validation);
  } catch (error) {
    next(error);
  }
};


const getPlatformInstructions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const platforms = {
      google_drive: {
        name: "Google Drive",
        icon: "📁",
        instructions: [
          "1. Open your file in Google Drive",
          "2. Click the 'Share' button",
          "3. Change access to 'Anyone with the link'",
          "4. Click 'Copy link'",
          "5. Paste the link here"
        ],
        urlPattern: "https://drive.google.com/file/d/...",
        sharingDocs: "https://support.google.com/drive/answer/2494822"
      },
      onedrive: {
        name: "OneDrive",
        icon: "☁️",
        instructions: [
          "1. Right-click your file in OneDrive",
          "2. Click 'Share'",
          "3. Click 'Copy link'",
          "4. Make sure it's set to 'Anyone with the link can view'",
          "5. Paste the link here"
        ],
        urlPattern: "https://1drv.ms/... or https://onedrive.live.com/...",
        sharingDocs: "https://support.microsoft.com/en-us/office/share-onedrive-files-and-folders-9fcc2f7d-de0c-4cec-93b0-a82024800c07"
      },
      dropbox: {
        name: "Dropbox",
        icon: "📦",
        instructions: [
          "1. Right-click your file in Dropbox",
          "2. Click 'Share'",
          "3. Click 'Create link'",
          "4. Click 'Copy link'",
          "5. Paste the link here"
        ],
        urlPattern: "https://www.dropbox.com/...",
        sharingDocs: "https://help.dropbox.com/share/view-only-access"
      },
      icloud: {
        name: "iCloud",
        icon: "☁️",
        instructions: [
          "1. Select your file in iCloud",
          "2. Click the share icon",
          "3. Click 'Copy Link'",
          "4. Paste the link here"
        ],
        urlPattern: "https://www.icloud.com/...",
        sharingDocs: "https://support.apple.com/guide/icloud/share-files-and-folders-mm9945d1f9f7/icloud"
      },
      other_url: {
        name: "Other URL",
        icon: "🔗",
        instructions: [
          "Make sure the URL is:",
          "- Publicly accessible",
          "- A direct link to the document",
          "- From a trusted source",
          "- Not password protected"
        ],
        urlPattern: "https://...",
        sharingDocs: null
      }
    };

    res.json({ platforms });
  } catch (error) {
    next(error);
  }
};

export {
  upload,
  uploadAvatar,
  uploadDocument,
  uploadApplicationDocument,
  addDocumentLink,
  addApplicationDocumentLink,
  validateDocumentLink,
  getPlatformInstructions
};
