import mongoose from 'mongoose';


const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
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
}, {
  timestamps: true
});

export default mongoose.model('Profile', profileSchema);
