const Income = require('../models/Income');
const Category = require('../models/Category');

// @desc    Create a new income
// @route   POST /api/incomes
// @access  Private
const createIncome = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    // Validation
    if (!title || !amount || !category) {
      return res.status(400).json({ message: 'Please provide title, amount, and category' });
    }

    if (amount < 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' });
    }

    // Check if category exists and belongs to user
    const categoryExists = await Category.findOne({
      _id: category,
      user: req.user._id,
      type: 'income',
    });

    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found or not an income category' });
    }

    // Create income
    const income = await Income.create({
      title,
      amount,
      category,
      date: date || Date.now(),
      description,
      user: req.user._id,
    });

    // Populate category details
    await income.populate('category', 'name type');

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all incomes for logged-in user
// @route   GET /api/incomes
// @access  Private
const getIncomes = async (req, res) => {
  try {
    const { category, startDate, endDate, limit } = req.query;

    // Build filter
    let filter = { user: req.user._id };

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Get incomes
    let query = Income.find(filter)
      .populate('category', 'name type')
      .sort({ date: -1 }); // Sort by date, newest first

    // Limit results if specified
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const incomes = await query;

    // Calculate total
    const total = incomes.reduce((sum, income) => sum + income.amount, 0);

    res.status(200).json({
      count: incomes.length,
      total: total,
      incomes: incomes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single income by ID
// @route   GET /api/incomes/:id
// @access  Private
const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id).populate('category', 'name type');

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // Make sure user owns this income
    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this income' });
    }

    res.status(200).json(income);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update an income
// @route   PUT /api/incomes/:id
// @access  Private
const updateIncome = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // Make sure user owns this income
    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this income' });
    }

    // Validation
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' });
    }

    // If category is being updated, verify it exists and is an income category
    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id,
        type: 'income',
      });

      if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found or not an income category' });
      }
    }

    // Update fields
    income.title = title || income.title;
    income.amount = amount !== undefined ? amount : income.amount;
    income.category = category || income.category;
    income.date = date || income.date;
    income.description = description !== undefined ? description : income.description;

    const updatedIncome = await income.save();
    await updatedIncome.populate('category', 'name type');

    res.status(200).json(updatedIncome);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete an income
// @route   DELETE /api/incomes/:id
// @access  Private
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // Make sure user owns this income
    if (income.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this income' });
    }

    await income.deleteOne();

    res.status(200).json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
};