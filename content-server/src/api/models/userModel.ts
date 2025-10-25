import mongoose from 'mongoose';
import {UserInfo} from '../../types/LocalTypes';

const userSchema = new mongoose.Schema<UserInfo>({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    minLength: 2,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  user_level_id: {
    type: Number,
    required: true,
    default: 1, // Default 1 = User (2 = Admin)
  },
  registeredAt: {
    type: String,
    required: true,
    default: () => new Date().toISOString(),
  },
  favorites: {
    type: [String],
    required: false,
    default: [],
  },
  documents: {
    type: [String],
    required: false,
    default: [],
  },
  exchangeBadge: {
    type: Boolean,
    required: false,
    default: false,
  },
  avatarUrl: {
    type: String,
    required: false,
  },
  linkedinUrl: {
    type: String,
    required: false,
  },
});

export default mongoose.model<UserInfo>('User', userSchema);
