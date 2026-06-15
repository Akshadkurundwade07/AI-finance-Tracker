const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster user queries
  },
  type: {
    type: String,
    required: true,
    enum: ['borrowed', 'lent'],
    index: true // Index for filtering by type
  },
  personName: {
    type: String,
    required: [true, 'Person name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  borrowedDate: {
    type: Date,
    required: true,
    default: Date.now,
    index: true // Index for date sorting
  },
  dueDate: {
    type: Date,
    required: false,
    index: true // Index for overdue queries
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending',
    index: true // Index for status filtering
  },
  contactInfo: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
loanSchema.index({ userId: 1, status: 1, borrowedDate: -1 }); // Most common query pattern
loanSchema.index({ userId: 1, type: 1, status: 1 }); // Filter by type and status

// Virtual for remaining amount
loanSchema.virtual('remainingAmount').get(function() {
  return this.amount - this.amountPaid;
});

// Ensure virtuals are included in JSON
loanSchema.set('toJSON', { virtuals: true });
loanSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Loan', loanSchema);
