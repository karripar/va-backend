import { UserDocument } from "../api/models/userModel";
import { TokenContent } from "va-hybrid-types/DBTypes";

declare global {
  namespace Express {
    interface User extends UserDocument, TokenContent {}

    interface Request {
      user?: User;
    }
  }
}
