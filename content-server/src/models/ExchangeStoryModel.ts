import mongoose from 'mongoose';

const ratingsSchema = new mongoose.Schema({
  overall: { type: Number, min: 1, max: 5, required: true },
  culture: { type: Number, min: 1, max: 5, required: true },
  academics: { type: Number, min: 1, max: 5, required: true },
  social: { type: Number, min: 1, max: 5, required: true },
  costOfLiving: { type: Number, min: 1, max: 5, required: true }
}, { _id: false });

const exchangeStorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  userAvatar: { type: String, default: '' },

  destination: { type: String, required: true },
  country: { type: String, required: true, index: true },
  university: { type: String, required: true },
  duration: { type: Number, required: true },
  exchangeDate: { type: String, required: true },

  title: { type: String, required: true },
  summary: { type: String, required: true },
  highlights: [{ type: String }],
  challenges: [{ type: String }],
  tips: [{ type: String }],

  coverPhoto: { type: String, required: true },
  photos: [{ type: String }],

  ratings: { type: ratingsSchema, required: true },

  likes: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },

  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  tags: [{ type: String, index: true }],
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Compound indexes
exchangeStorySchema.index({ status: 1, createdAt: -1 });
exchangeStorySchema.index({ featured: 1, status: 1 });

// Text index for search
exchangeStorySchema.index({ title: 'text', summary: 'text', university: 'text' });

const ExchangeStory = mongoose.model('ExchangeStory', exchangeStorySchema);

export default ExchangeStory;
