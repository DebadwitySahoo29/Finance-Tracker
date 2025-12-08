const express = require('express');
const {
  createIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected (require authentication)
router.route('/').post(protect, createIncome).get(protect, getIncomes);

router
  .route('/:id')
  .get(protect, getIncomeById)
  .put(protect, updateIncome)
  .delete(protect, deleteIncome);

module.exports = router;