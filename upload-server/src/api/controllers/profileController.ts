import {Request, Response, NextFunction} from 'express';
import multer from 'multer';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import { platformInstructions, platformPatterns } from '../../utils/platformHelpers';

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
  limits: {fileSize: 10 * 1024 * 1024}, // 20MB limit
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
  return "1"; // Mock user ID
};

const validateSourceType = (sourceType: string): boolean => {
  const validSourceTypes = ["google_drive", "onedrive", "dropbox", "icloud", "other_url"];
  return validSourceTypes.includes(sourceType);
};

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

// ===== LINK-BASED DOCUMENT ENDPOINTS =====

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

    // TODO: Save to database
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

    // TODO: Save to database
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
    res.json({ platforms: platformInstructions });
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
