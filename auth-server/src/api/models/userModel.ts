import mongoose from 'mongoose';

// database schema type user info
type UserInfo = {
  id: string;
  googleId: string;
  userName: string;
  email: string;
  registeredAt: Date;
  favorites: string[];
  documents: string[];
  exchangeBadge?: boolean;
  avatarUrl?: string;
  linkedinUrl?: string;
};


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
  registeredAt: {
    type: Date,
    required: true,
    default: Date.now,
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
