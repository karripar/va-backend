import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  destination: { type: String, default: '' },
  exchangeProgramId: { type: String },
  categories: {
    matkakulut: { amount: Number, notes: String },
    vakuutukset: { amount: Number, notes: String },
    asuminen: { amount: Number, notes: String },
    ruoka_ja_arki: { amount: Number, notes: String },
    opintovalineet: { amount: Number, notes: String }
  },
  totalAmount: { type: Number, default: 0 }
}, {
  timestamps: true,
  collection: 'budgets'
});

budgetSchema.index({ updatedAt: -1 });

export const Budget =
  mongoose.models.Budget ||
  mongoose.model('Budget', budgetSchema);


const grantSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  grantType: String,
  title: String,
  description: String,
  status: String,
  estimatedAmount: Number,
  documents: [mongoose.Schema.Types.Mixed],
  destination: String,
  program: String
}, {
  timestamps: true,
  collection: 'grants'
});

export const Grant =
  mongoose.models.Grant ||
  mongoose.model('Grant', grantSchema);


const kelaSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  status: String,
  monthlyAmount: Number,
  duration: Number,
  totalAmount: Number,
  studyAbroadConfirmation: Boolean,
  applicationSubmitted: Boolean,
  documents: [mongoose.Schema.Types.Mixed],
  destination: String
}, {
  timestamps: true,
  collection: 'kela'
});

export const Kela =
  mongoose.models.Kela ||
  mongoose.model('Kela', kelaSchema);
