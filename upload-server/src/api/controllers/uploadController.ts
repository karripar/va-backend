import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import fs from 'fs';
import path from 'path';
import {MessageResponse} from 'va-hybrid-types/MessageTypes';

const UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';

// create uploads directory if it doesn't exist
fs.mkdirSync(UPLOAD_DIR, {recursive: true});

type UploadResponse = MessageResponse & {
  data: {
    filename: string;
    url: string;
    media_type: string;
    filesize: number;
  };
};

// upload a document (admin only)
const uploadDocument = async (
  req: Request,
  res: Response<UploadResponse>,
  next: NextFunction
) => {
  const tempFiles: string[] = [];
  try {
    // check if user is admin
    if (res.locals.user.user_level_id !== 2) {
      throw new CustomError('Forbidden: admin only', 403);
    }

    if (!req.file) {
      throw new CustomError('No valid file', 400);
    }

    const extension = req.file.originalname.split('.').pop();
    if (!extension) {
      throw new CustomError('Invalid file extension', 400);
    }

    // construct the public URL using environment variables
    const baseUrl =
      process.env.PUBLIC_UPLOADS_URL || 'http://localhost:3003/uploads';
    const publicUrl = `${baseUrl}/${req.file.filename}`;

    const response: UploadResponse = {
      message: 'File uploaded',
      data: {
        filename: req.file.filename,
        url: publicUrl,
        media_type: req.file.mimetype,
        filesize: req.file.size,
      },
    };

    res.json(response);
  } catch (err) {
    cleanup(tempFiles);
    next(
      err instanceof CustomError
        ? err
        : new CustomError('An error occurred', 400)
    );
  }
};

/**
 * delete uploaded document
 * admins only
 */

const deleteUploadedDocument = async (
  req: Request<{filename: string}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const {filename} = req.params;
    if (!filename) {
      throw new CustomError('No filename provided', 400);
    }

    // Check if the user is an admin
    if (res.locals.user.user_level_id !== 2) {
      throw new CustomError('Unauthorized. Admin access required.', 403);
    }

    const filePath = `${UPLOAD_DIR}/${filename}`;

    if (!fs.existsSync(filePath)) {
      throw new CustomError('File not found', 404);
    }

    try {
      // delete the exact file requested
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
      throw new CustomError('An error occurred while deleting the file', 500);
    }

    res.json({message: 'File deleted successfully'});
  } catch (err) {
    next(
      err instanceof CustomError
        ? err
        : new CustomError('An error occurred', 400)
    );
  }
};

const cleanup = (files: string[]) => {
  files.forEach((file) => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch (err) {
      console.error(err);
    }
  });
};

// Get all documents (admin only)
const listDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // check if user is admin
    if (res.locals.user.user_level_id !== 2) {
      next(new CustomError('Unauthorized. Admin access required.', 403));
      return;
    }

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, {recursive: true});
    }

    // Read all files from the uploads directory
    const files = fs.readdirSync(UPLOAD_DIR);

    const documents = files.map((filename) => {
      const filePath = path.join(UPLOAD_DIR, filename);
      const stats = fs.statSync(filePath);
      const extension = path.extname(filename).toLowerCase();

      // Map extensions to MIME types
      const mimeTypes: {[key: string]: string} = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      };

      // Construct the public URL using environment variables
      const baseUrl =
        process.env.PUBLIC_UPLOADS_URL || 'http://localhost:3003/uploads';
      const publicUrl = `${baseUrl}/${filename}`;

      return {
        filename,
        url: publicUrl,
        media_type: mimeTypes[extension] || 'application/octet-stream',
        filesize: stats.size,
        uploadedAt: stats.birthtime.toISOString(),
      };
    });

    res.json({documents});
  } catch (err) {
    next(
      err instanceof CustomError
        ? err
        : new CustomError('Failed to list documents', 500)
    );
  }
};

export {uploadDocument, deleteUploadedDocument, listDocuments};
