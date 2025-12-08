const Category = require('../models/Category');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    // Validation
    if (!name || !type) {
      return res.status(400).json({ message: 'Please provide name and type' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either income or expense' });
    }

    // Check if category already exists for this user
    const categoryExists = await Category.findOne({
      name: name.trim(),
      type,
      user: req.user._id,
    });

    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Create category
    const category = await Category.create({
      name: name.trim(),
      type,
      user: req.user._id,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all categories for logged-in user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const { type } = req.query; // Optional filter by type (?type=income or ?type=expense)

    let filter = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ createdAt: -1 });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Make sure user owns this category
    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this category' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Make sure user owns this category
    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this category' });
    }

    // Validation
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either income or expense' });
    }

    // Update fields
    category.name = name || category.name;
    category.type = type || category.type;

    const updatedCategory = await category.save();

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Make sure user owns this category
    if (category.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this category' });
    }

    await category.deleteOne();

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};