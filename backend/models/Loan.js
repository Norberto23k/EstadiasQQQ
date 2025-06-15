import mongoose from 'mongoose';

const LoanSchema = new mongoose.Schema({
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  expectedReturnDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'overdue'], default: 'active' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Loan', LoanSchema);