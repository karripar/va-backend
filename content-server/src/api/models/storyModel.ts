import { Schema, model, Types } from 'mongoose';

const ReactionSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'save'], required: true },
}, { _id: false });

const RatingSchema = new Schema({
  overall: { type: Number, min: 1, max: 5, default: 5 },
  culture: { type: Number, min: 1, max: 5, default: 5 },
  academics: { type: Number, min: 1, max: 5, default: 5 },
}, { _id: false });

const StorySchema = new Schema({
  title: { type: String, required: true },
  destination: { type: String, required: true },
  university: { type: String, required: true },
  country: { type: String, required: true },
  coverPhoto: { type: String },
  photos: [{ type: String }],
  content: { type: String, required: true },

  highlights: String,
  challenges: String,
  tips: String,

  ratings: RatingSchema,

  createdBy: { type: Types.ObjectId, ref: 'User', required: true },

  reactions: [ReactionSchema],

  isApproved: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },

}, { timestamps: true,
     collection: 'exchangeStories'
 });


export default model('Story', StorySchema);
