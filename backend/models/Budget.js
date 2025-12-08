const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a budget amount'],
      min: [0, 'Budget amount cannot be negative'],
    },
    month: {
      type: Number,
      required: [true, 'Please provide a month'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please provide a year'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one budget per category per month per user
budgetSchema.index({ category: 1, month: 1, year: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);