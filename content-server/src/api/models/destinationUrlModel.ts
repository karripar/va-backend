import mongoose, { Schema, Document } from 'mongoose';

export interface IDestinationUrl extends Document {
  field: 'tech' | 'health' | 'business' | 'culture';
  lang: 'en' | 'fi';
  url: string;
  lastModified: Date;
  updatedBy?: mongoose.Types.ObjectId; // optional link to admin user
}

const destinationUrlSchema = new Schema<IDestinationUrl>({
  field: {
    type: String,
    enum: ['tech', 'health', 'business', 'culture'],
    required: true,
  },
  lang: {
    type: String,
    enum: ['en', 'fi'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

// Ensure unique URL per field+lang combination
destinationUrlSchema.index({ field: 1, lang: 1 }, { unique: true });

const DestinationUrlModel = mongoose.model<IDestinationUrl>(
  'DestinationUrl',
  destinationUrlSchema
);

export default DestinationUrlModel;
