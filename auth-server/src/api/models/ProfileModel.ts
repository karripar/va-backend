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
  }]
}, {
  timestamps: true,
  collection: 'profiles'
});

const Profile =
  mongoose.models.Profile ||
  mongoose.model('Profile', profileSchema);

export default Profile;
