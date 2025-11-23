import {Request, Response, NextFunction} from 'express';
/* import multer from 'multer';
import path from 'path'; */
import {v4 as uuidv4} from 'uuid';
import { platformInstructions, platformPatterns } from '../../../utils/constants';
import LinkDocument from '../../models/LinkDocumentModel';



const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserFromRequest(req);
    const docs = await LinkDocument.find({ userId });
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

/* const upload = multer({
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
}); */

/**
 * Extracts the authenticated user's id from the request.
 * Throws if user is not authenticated (should not happen if authenticate middleware is used).
 */
const getUserFromRequest = (req: Request): string => {
  if (req.user && req.user._id) {
    return req.user._id.toString();
  }
  throw new Error('User not authenticated');
};

const validateSourceType = (sourceType: string): boolean => {
  const validSourceTypes = ["google_drive", "onedrive", "dropbox", "icloud", "other_url"];
  return validSourceTypes.includes(sourceType);
};

/* const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({message: 'No file uploaded'});
    }

    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    res.json({url: fileUrl});
  } catch (error) {
    next(error);
  }
}; */

/* const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({message: 'No file uploaded'});
    }

    const fileUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    res.json({url: fileUrl, name: req.file.originalname});
  } catch (error) {
    next(error);
  }
}; */

/* const uploadApplicationDocument = async (req: Request, res: Response, next: NextFunction) => {
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
}; */

// ===== LINK-BASED DOCUMENT =====

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
    // Saving the link
    const saved = await LinkDocument.create(documentLink);
    res.status(201).json(saved);
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

    // Saving the link
    const saved = await LinkDocument.create(applicationDocumentLink);
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

import fetch from 'node-fetch';

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

    let isAccessible = false;
    let errorMessage = null;
    if (isValidFormat) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        let response;
        try {
          response = await fetch(url, { method: 'HEAD', signal: controller.signal });
        } finally {
          clearTimeout(timeout);
        }
        isAccessible = response.ok;
        if (!isAccessible) {
          errorMessage = `URL responded with status ${response.status}`;
        }
      } catch (err) {
        isAccessible = false;
        errorMessage = `Could not access URL: ${err instanceof Error ? err.message : 'Unknown error'}`;
      }
    } else {
      errorMessage = "URL format does not match expected pattern for platform";
    }

    const validation = {
      isValid: isValidFormat,
      isAccessible,
      errorMessage,
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
  /* upload,
  uploadAvatar,
  uploadDocument,
  uploadApplicationDocument, */
  addDocumentLink,
  addApplicationDocumentLink,
  validateDocumentLink,
  getPlatformInstructions,
  getDocuments
};
