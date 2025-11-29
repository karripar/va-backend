import mongoose from 'mongoose';

const userLevelSchema = new mongoose.Schema({
  user_level_id: {
    type: Number,
    required: true,
    unique: true,
  },
  level_name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Admin', 'User', 'SuperAdmin'],
  }
}, {
  collection: 'userLevels'
});

export default mongoose.model('UserLevel', userLevelSchema);
