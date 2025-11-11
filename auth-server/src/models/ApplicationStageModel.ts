import mongoose from 'mongoose';

const externalLinkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const applicationStageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  phase: {
    type: String,
    required: true,
    enum: ['esihaku', 'nomination', 'apurahat', 'vaihdon_jalkeen']
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredDocuments: [{ type: String }],
  optionalDocuments: [{ type: String }],
  externalLinks: [externalLinkSchema],
  deadline: { type: Date },
  order: { type: Number, required: true }
}, {
  timestamps: true
});

const ApplicationStage = mongoose.model('ApplicationStage', applicationStageSchema);

export default ApplicationStage;
