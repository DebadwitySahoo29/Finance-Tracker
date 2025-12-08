const express = require('express');
const {
  getSummary,
  getExpensesByCategory,
  getIncomeByCategory,
  getMonthlySummary,
  getRecentTransactions,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected (require authentication)
router.get('/summary', protect, getSummary);
router.get('/expenses-by-category', protect, getExpensesByCategory);
router.get('/income-by-category', protect, getIncomeByCategory);
router.get('/monthly-summary', protect, getMonthlySummary);
router.get('/recent-transactions', protect, getRecentTransactions);

module.exports = router;