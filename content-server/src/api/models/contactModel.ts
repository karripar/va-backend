import mongoose, { Schema, Document } from "mongoose";

export interface IContactResponse {
  message: string;
  sentAt: Date;
  adminId: mongoose.Types.ObjectId; // optional link to the admin who replied
}

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
  status: "new" | "replied" | "closed";
  responses: IContactResponse[];
}

const ContactResponseSchema = new Schema<IContactResponse>(
  {
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    adminId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false } // embedded subdocument, no separate _id
);

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "replied", "closed"],
      default: "new",
    },
    responses: [ContactResponseSchema],
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);
