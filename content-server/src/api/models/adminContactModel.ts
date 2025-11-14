import mongoose, { Schema, Document } from "mongoose";

/**
 * Represents an admin or staff contact entry
 * displayed on the Contact page.
 */
export interface IAdminContact extends Document {
  name: string;
  title: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminContactSchema = new Schema<IAdminContact>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true},
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

export default mongoose.model<IAdminContact>("AdminContact", AdminContactSchema);
