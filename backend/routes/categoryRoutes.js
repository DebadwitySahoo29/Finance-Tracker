const express = require('express');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected (require authentication)
router.route('/').post(protect, createCategory).get(protect, getCategories);

router
  .route('/:id')
  .get(protect, getCategoryById)
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

module.exports = router;