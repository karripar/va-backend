import mongoose from 'mongoose';

const applicationStageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  phase: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredDocuments: [{ type: String }],
  optionalDocuments: [{ type: String }],
  externalLinks: [{
    title: String,
    url: String,
    description: String
  }],
  deadline: { type: Date },
  order: { type: Number, required: true }
}, {
  timestamps: true,
  collection: 'applicationStages'
});

const ApplicationStage =
  mongoose.models.ApplicationStage ||
  mongoose.model('ApplicationStage', applicationStageSchema);

export default ApplicationStage;

