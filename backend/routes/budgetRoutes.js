const express = require('express');
const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
  getAllBudgetStatuses,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected (require authentication)
router.route('/').post(protect, createBudget).get(protect, getBudgets);

router.get('/status/all', protect, getAllBudgetStatuses);

router
  .route('/:id')
  .get(protect, getBudgetById)
  .put(protect, updateBudget)
  .delete(protect, deleteBudget);

router.get('/:id/status', protect, getBudgetStatus);

module.exports = router;