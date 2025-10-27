import {Request, Response, NextFunction} from 'express';
import multer from 'multer';
import path from 'path';
import {v4 as uuidv4} from 'uuid';

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

export {upload, uploadAvatar, uploadDocument, uploadApplicationDocument};
