const mongoose = require('mongoose');

const laundrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
    required: true
  }],
  washDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expectedReturnDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['washing', 'drying', 'ready', 'delayed'],
    default: 'washing'
  },
  washType: {
    type: String,
    enum: ['normal', 'delicate', 'hand-wash', 'dry-clean'],
    default: 'normal'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
laundrySchema.index({ userId: 1, status: 1 });
laundrySchema.index({ userId: 1, expectedReturnDate: 1 });

// Method to check if laundry is overdue
laundrySchema.methods.isOverdue = function() {
  return this.status !== 'ready' && new Date() > this.expectedReturnDate;
};

// Method to get days until return
laundrySchema.methods.getDaysUntilReturn = function() {
  const now = new Date();
  const returnDate = new Date(this.expectedReturnDate);
  const diffTime = returnDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

module.exports = mongoose.model('Laundry', laundrySchema);
