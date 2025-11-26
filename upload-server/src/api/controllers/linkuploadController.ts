import {Request, Response, NextFunction} from 'express';
import fetch, {Response as FetchResponse} from 'node-fetch';
import LinkDocument from '../../api/models/linkUploadModel';
import {
  platformInstructions,
  platformPatterns,
} from '../../utils/linkUploadHelper';

const getUserFromRequest = (req: Request): string => {
  const user = (req as Request & {user?: {_id: string}}).user;
  if (user && user._id) {
    return user._id.toString();
  }
  throw new Error('User not authenticated');
};

// Validating allowed source types
const validateSourceType = (sourceType: string): boolean => {
  const validSourceTypes = [
    'google_drive',
    'onedrive',
    'dropbox',
    'icloud',
    'other_url',
  ];
  return validSourceTypes.includes(sourceType);
};

// Getting all documents & can be filtered by userId or applicationId
type LinkDocumentQuery = {
  userId?: string;
  applicationId?: string;
};
const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query: LinkDocumentQuery = {};
    if (req.query.userId) query.userId = String(req.query.userId);
    if (req.query.applicationId)
      query.applicationId = String(req.query.applicationId);

    const docs = await LinkDocument.find(query).sort({addedAt: -1});
    res.json(docs);
  } catch (error) {
    next(error);
  }
};

// A generic link document
const addDocumentLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserFromRequest(req);
    const {name, url, sourceType, notes} = req.body;

    if (!name || !url || !sourceType) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'name, url, and sourceType are required',
      });
    }

    if (!validateSourceType(sourceType)) {
      return res.status(400).json({
        error: 'Invalid source type',
        validTypes: [
          'google_drive',
          'onedrive',
          'dropbox',
          'icloud',
          'other_url',
        ],
      });
    }

    const documentLink = {
      userId,
      name,
      url,
      sourceType,
      addedAt: new Date().toISOString(),
      isAccessible: true,
      accessPermission: 'public',
      notes: notes || null,
    };

    const saved = await LinkDocument.create(documentLink);
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

// Adding a link
const addApplicationDocumentLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserFromRequest(req);
    const {phase, documentType, fileName, fileUrl, sourceType, notes} =
      req.body;

    if (!phase || !documentType || !fileUrl || !sourceType) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'phase, documentType, fileUrl, and sourceType are required',
      });
    }

    if (!validateSourceType(sourceType)) {
      return res.status(400).json({
        error: 'Invalid source type',
        validTypes: [
          'google_drive',
          'onedrive',
          'dropbox',
          'icloud',
          'other_url',
        ],
      });
    }

    const applicationDocumentLink = {
      userId,
      name: fileName || `document-${Date.now()}.ext`,
      url: fileUrl,
      sourceType,
      addedAt: new Date().toISOString(),
      isAccessible: true,
      accessPermission: 'public',
      notes: notes || null,
      applicationId: `app-${userId}-${Date.now()}`,
      applicationPhase: phase,
      documentType,
      addedBy: userId,
    };

    const saved = await LinkDocument.create(applicationDocumentLink);
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

// Validating a link URL
const validateDocumentLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {url, sourceType} = req.body;

    if (!url || !sourceType) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'url and sourceType are required',
      });
    }

    if (!validateSourceType(sourceType)) {
      return res.status(400).json({
        error: 'Invalid source type',
        validTypes: [
          'google_drive',
          'onedrive',
          'dropbox',
          'icloud',
          'other_url',
        ],
      });
    }

    const pattern = platformPatterns[sourceType];
    const isValidFormat = pattern ? pattern.test(url) : false;

    let isAccessible = false;
    let errorMessage: string | null = null;
    if (isValidFormat) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        let response: FetchResponse | undefined;
        try {
          response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeout);
        }
        isAccessible = !!(response && response.ok);
        if (!isAccessible) {
          errorMessage = `URL responded with status ${
            response?.status || 'unknown'
          }`;
        }
      } catch (err) {
        isAccessible = false;
        errorMessage = `Could not access URL: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`;
      }
    } else {
      errorMessage = 'URL format does not match expected pattern for platform';
    }

    const validation = {
      isValid: isValidFormat,
      isAccessible,
      errorMessage,
      checkedAt: new Date().toISOString(),
      platform: sourceType,
    };

    res.json(validation);
  } catch (error) {
    next(error);
  }
};

//  Instructions
const getPlatformInstructions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({platforms: platformInstructions});
  } catch (error) {
    next(error);
  }
};

export {
  getDocuments,
  addDocumentLink,
  addApplicationDocumentLink,
  validateDocumentLink,
  getPlatformInstructions,
};
