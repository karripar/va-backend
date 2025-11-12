import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatarUrl: { type: String, default: '' },
  favorites: [{ type: String }],
  documents: [{
    id: String,
    name: String,
    url: String,
    sourceType: String,
    addedAt: String,
    isAccessible: Boolean,
    accessPermission: String,
    notes: String
  }],
  exchangeBadge: { type: Boolean, default: false },
  linkedinUrl: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.model('Profile', profileSchema);
