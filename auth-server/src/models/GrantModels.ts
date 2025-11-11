import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  destination: { type: String, default: '' },
  grantAmount: { type: Number, default: 0 },
  categories: {
    matkakulut: {
      estimatedCost: { type: Number, default: 0 },
      notes: { type: String }
    },
    vakuutukset: {
      estimatedCost: { type: Number, default: 0 },
      notes: { type: String }
    },
    asuminen: {
      estimatedCost: { type: Number, default: 0 },
      notes: { type: String }
    },
    'ruoka ja arki': {
      estimatedCost: { type: Number, default: 0 },
      notes: { type: String }
    },
    opintovalineet: {
      estimatedCost: { type: Number, default: 0 },
      notes: { type: String }
    }
  },
  totalEstimate: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'EUR' }
}, {
  timestamps: true
});

budgetSchema.index({ updatedAt: -1 });

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
  timestamps: true
});

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
  timestamps: true
});

export const Budget = mongoose.model('Budget', budgetSchema);
export const Grant = mongoose.model('Grant', grantSchema);
export const Kela = mongoose.model('Kela', kelaSchema);
