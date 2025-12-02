import { Schema, model, Types } from 'mongoose';

const StorySchema = new Schema({
  title: { type: String, required: true },
  city: { type: String, required: true },
  university: { type: String, required: true },
  country: { type: String, required: true },
  content: { type: String, required: true },

  highlights: String,
  challenges: String,
  tips: String,

  createdBy: { type: Types.ObjectId, ref: 'User', required: true },

  isApproved: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },

}, { timestamps: true,
     collection: 'exchangeStories'
 });


export default model('Story', StorySchema);
