import mongoose from 'mongoose';

const userApplicationProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  stageId: { type: String, required: true, index: true },
  status: {
    type: String,
    required: true,
    enum: ['not_started', 'in_progress', 'pending_review', 'completed', 'on_hold'],
    default: 'not_started'
  },
  completedAt: { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'userApplicationProgress'
});

userApplicationProgressSchema.index(
  { userId: 1, stageId: 1 },
  { unique: true }
);

const UserApplicationProgress =
  mongoose.models.UserApplicationProgress ||
  mongoose.model('UserApplicationProgress', userApplicationProgressSchema);

export default UserApplicationProgress;
