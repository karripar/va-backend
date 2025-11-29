import mongoose from 'mongoose';

const linkDocumentSchema = new mongoose.Schema({
  id: { type: String },
  userId: { type: String, required: true },

  name: { type: String },
  url: { type: String },
  sourceType: { type: String },
  addedAt: { type: String },

  isAccessible: { type: Boolean },
  accessPermission: { type: String },
  notes: { type: String },

  // Application document fields
  applicationId: { type: String },
  applicationPhase: { type: String },
  documentType: { type: String },
  fileName: { type: String },
  fileUrl: { type: String },
  addedBy: { type: String },
  isRequired: { type: Boolean },
}, {
  timestamps: true,
  collection: 'linkDocuments'
});

// Preventing model overwrite in development
const LinkDocument =
  mongoose.models.LinkDocument ||
  mongoose.model('LinkDocument', linkDocumentSchema);

export default LinkDocument;
