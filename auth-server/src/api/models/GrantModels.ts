import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  destination: { type: String, default: '' },
  exchangeProgramId: { type: String },
  categories: {
    matkakulut: {
      amount: { type: Number, default: 0 },
      notes: { type: String, default: '' }
    },
    vakuutukset: {
      amount: { type: Number, default: 0 },
      notes: { type: String, default: '' }
    },
    asuminen: {
      amount: { type: Number, default: 0 },
      notes: { type: String, default: '' }
    },
    ruoka_ja_arki: {
      amount: { type: Number, default: 0 },
      notes: { type: String, default: '' }
    },
    opintovalineet: {
      amount: { type: Number, default: 0 },
      notes: { type: String, default: '' }
    }
  },
  totalAmount: { type: Number, default: 0 }
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
