import { Request } from 'express';

/**
 * Extract user ID from request
 * Replacing with JWT token extraction later
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getUserFromRequest = (req: Request): string => {
  return "1"; // Mock user ID for now
};


export const validateRequiredFields = (data: unknown, requiredFields: string[]): string[] => {
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
