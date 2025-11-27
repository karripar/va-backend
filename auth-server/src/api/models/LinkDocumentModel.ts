import mongoose from 'mongoose';

const linkDocumentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: String,
  url: String,
  sourceType: String,
  addedAt: String,
  isAccessible: Boolean,
  accessPermission: String,
  notes: String,

  applicationId: String,
  applicationPhase: String,
  documentType: String,
  fileName: String,
  fileUrl: String,
  addedBy: String,
  isRequired: Boolean
}, {
  timestamps: true,
  collection: 'linkDocuments'
});

const LinkDocument =
  mongoose.models.LinkDocument ||
  mongoose.model('LinkDocument', linkDocumentSchema);

export default LinkDocument;

