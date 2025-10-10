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
  },
  registeredAt: {
    type: String,
    required: true,
    default: () => new Date().toISOString(),
  },
  favorites: {
    type: [String],
    required: true,
    default: [],
  },
  documents: {
    type: [String],
    required: true,
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
