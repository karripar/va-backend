import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  applications: [{
    phase: String,
    data: mongoose.Schema.Types.Mixed,
    documents: [{
      id: String,
      applicationId: String,
      applicationPhase: String,
      documentType: String,
      fileName: String,
      fileUrl: String,
      sourceType: String,
      addedAt: String,
      addedBy: String,
      isAccessible: Boolean,
      accessPermission: String,
      isRequired: Boolean,
      notes: String
    }],
    submittedAt: String,
    status: String,
    reviewedBy: String,
    reviewNotes: String,
    reviewedAt: String
  }],
  currentPhase: String
}, {
  timestamps: true,
  collection: 'applications'
});

const Application =
  mongoose.models.Application ||
  mongoose.model('Application', applicationSchema);

export default Application;

