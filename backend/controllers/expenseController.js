const Expense = require('../models/Expense');
const Category = require('../models/Category');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
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
      type: 'expense',
    });

    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found or not an expense category' });
    }

    // Create expense
    const expense = await Expense.create({
      title,
      amount,
      category,
      date: date || Date.now(),
      description,
      user: req.user._id,
    });

    // Populate category details
    await expense.populate('category', 'name type');

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all expenses for logged-in user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
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

    // Get expenses
    let query = Expense.find(filter)
      .populate('category', 'name type')
      .sort({ date: -1 }); // Sort by date, newest first

    // Limit results if specified
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const expenses = await query;

    // Calculate total
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.status(200).json({
      count: expenses.length,
      total: total,
      expenses: expenses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('category', 'name type');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure user owns this expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this expense' });
    }

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure user owns this expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this expense' });
    }

    // Validation
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' });
    }

    // If category is being updated, verify it exists and is an expense category
    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id,
        type: 'expense',
      });

      if (!categoryExists) {
        return res.status(404).json({ message: 'Category not found or not an expense category' });
      }
    }

    // Update fields
    expense.title = title || expense.title;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.description = description !== undefined ? description : expense.description;

    const updatedExpense = await expense.save();
    await updatedExpense.populate('category', 'name type');

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Make sure user owns this expense
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    await expense.deleteOne();

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};