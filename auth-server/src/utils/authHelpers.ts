/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
/**
 * Extract user ID from request
 */
// Accept both req and res, use res.locals.user._id as set by middleware

export const getUserFromRequest = (req: Request, res?: Response): string => {
  // Primary source: res.locals.user (set by authenticate middleware)
  if (res?.locals?.user && (res.locals.user as any)._id) {
    return (res.locals.user as any)._id;
  }
const anyReq = req as any;
  if (anyReq.user && anyReq.user._id) {
    return anyReq.user._id;
  }

  return "";
};


export const validateRequiredFields = (data: unknown, requiredFields: string[]): string[] => {
  const missing: string[] = [];
  if (typeof data !== "object" || data === null) {
    return requiredFields.slice();
  }

  const dataObj = data as Record<string, unknown>;
  requiredFields.forEach(field => {
    if (!dataObj[field] && dataObj[field] !== 0) { // allow 0 values
      missing.push(field);
    } else if (dataObj[field] === "") {
      missing.push(field);
    }
  });

  return missing;
};

/**
 * Validating cloud storage source type
 */
export const validateSourceType = (sourceType: string): boolean => {
  const validSourceTypes = ["google_drive", "onedrive", "dropbox", "icloud", "other_url"];
  return validSourceTypes.includes(sourceType);
};

/**
 * Validating email format
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
