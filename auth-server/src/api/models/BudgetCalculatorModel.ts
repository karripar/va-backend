import mongoose from 'mongoose';

const calculatorHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  calculation: { type: String, required: true, maxlength: 100 },
  result: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, required: true }
}, {
  timestamps: false,
  collection: 'calculatorHistory'
});

calculatorHistorySchema.index({ userId: 1, timestamp: -1 });

export const CalculatorHistory =
  mongoose.models.CalculatorHistory ||
  mongoose.model('CalculatorHistory', calculatorHistorySchema);
