import mongoose from 'mongoose';

const storyReactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  storyId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  type: { type: String, enum: ['like', 'save'], required: true }
}, {
  timestamps: true
});

// Unique compound index
storyReactionSchema.index({ userId: 1, storyId: 1, type: 1 }, { unique: true });

const StoryReaction = mongoose.model('StoryReaction', storyReactionSchema);

export default StoryReaction;
