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
  city: { type: String, required: true },               
  university: { type: String, required: true },
  duration: { type: Number, required: true },
  exchangeDate: { type: String, required: true },

  title: { type: String, required: true },
  summary: { type: String, required: true },
  fullReport: { type: String, required: false },        
  highlights: [{ type: String }],
  challenges: [{ type: String }],
  tips: [{ type: String }],

  coverPhoto: { type: String, required: true },
  photos: [{ type: String }],

  ratings: { type: ratingsSchema, required: true },

  likes: { type: Number, default: 0 },
  saves: { type: Number, default: 0 },

  isApproved: { type: Boolean, default: false },        
  isFeatured: { type: Boolean, default: false },       
  createdBy: { type: String, required: false },         
  tags: [{ type: String, index: true }]
}, {
  timestamps: true
});

// Useful indexes
exchangeStorySchema.index({ isApproved: 1, createdAt: -1 });
exchangeStorySchema.index({ isFeatured: 1, isApproved: 1 });

// Text search index
exchangeStorySchema.index({ title: 'text', summary: 'text', university: 'text' });

const ExchangeStories = mongoose.model('ExchangeStory', exchangeStorySchema);

export default ExchangeStories;

