import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import fs from 'fs';
import path from 'path';
import {MessageResponse} from 'va-hybrid-types/MessageTypes';

/**
 * @module controllers/uploadController
 * @description Controller functions for handling file uploads, deletions, and listings.
 * All operations require admin authentication (user_level_id === 2).
 * Supports PDF, DOC, DOCX, PPT, and PPTX file types with a 20MB size limit.
 */

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

/**
 * @function uploadDocument
 * @description Uploads a document file to the server. Only accessible to admin users.
 * Accepts PDF, PPT, PPTX, DOC, DOCX files up to 20MB.
 * Files are saved with a timestamp suffix to prevent naming conflicts.
 *
 * @param {Request} req - Express request object with file in req.file (from multer).
 * @param {Response<UploadResponse>} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: Upload successful with file details (filename, url, media_type, filesize).
 * - 400: If no file provided or invalid file extension.
 * - 403: If user is not an admin.
 * - 413: If file size exceeds 20MB limit.
 *
 * @example
 * // POST /api/v1/uploads/upload
 * // Requires: Authorization header with admin token, file in multipart/form-data
 * uploadDocument(req, res, next);
 */
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
 * @function deleteUploadedDocument
 * @description Deletes an uploaded document by filename. Only accessible to admin users.
 * Removes the file from the file system permanently.
 *
 * @param {Request<{filename: string}>} req - Express request object with filename in params.
 * @param {Response<MessageResponse>} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: File deleted successfully.
 * - 400: If filename is not provided.
 * - 403: If user is not an admin.
 * - 404: If file does not exist.
 * - 500: On file system errors.
 *
 * @example
 * // DELETE /api/v1/uploads/delete/:filename
 * // Requires: Authorization header with admin token
 * deleteUploadedDocument(req, res, next);
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

/**
 * @function cleanup
 * @description Helper function to clean up temporary files in case of upload errors.
 * Attempts to delete each file in the provided array if it exists.
 *
 * @param {string[]} files - Array of file paths to delete.
 *
 * @returns {void}
 *
 * @example
 * cleanup(['/tmp/file1.pdf', '/tmp/file2.doc']);
 */
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

/**
 * @function listDocuments
 * @description Retrieves a list of all uploaded documents with their metadata.
 * Only accessible to admin users. Returns file details including name, URL, MIME type, size, and upload date.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware for error handling.
 *
 * @returns {Promise<void>} Responds with:
 * - 200: Array of document objects with filename, url, media_type, filesize, and uploadedAt.
 * - 403: If user is not an admin.
 * - 500: On file system or server errors.
 *
 * @example
 * // GET /api/v1/uploads/list
 * // Requires: Authorization header with admin token
 * listDocuments(req, res, next);
 */
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
