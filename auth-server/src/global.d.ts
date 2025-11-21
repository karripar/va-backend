import type { UserDocument } from './api/models/userModel';

//A global.d.ts file to extend Express Request type to include the user property

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export {};
