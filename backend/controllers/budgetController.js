const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Expense = require('../models/Expense');

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    // Validation
    if (!category || !amount || !month || !year) {
      return res.status(400).json({ message: 'Please provide category, amount, month, and year' });
    }

    if (amount < 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({ message: 'Month must be between 1 and 12' });
    }

    // Check if category exists and belongs to user
    const categoryExists = await Category.findOne({
      _id: category,
      user: req.user._id,
      type: 'expense', // Budgets are only for expense categories
    });

    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found or not an expense category' });
    }

    // Check if budget already exists for this category/month/year
    const budgetExists = await Budget.findOne({
      category,
      month,
      year,
      user: req.user._id,
    });

    if (budgetExists) {
      return res.status(400).json({ 
        message: 'Budget already exists for this category and month. Use update to modify it.' 
      });
    }

    // Create budget
    const budget = await Budget.create({
      category,
      amount,
      month,
      year,
      user: req.user._id,
    });

    // Populate category details
    await budget.populate('category', 'name type');

    res.status(201).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all budgets for logged-in user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const { month, year, category } = req.query;

    // Build filter
    let filter = { user: req.user._id };

    if (month) {
      filter.month = parseInt(month);
    }

    if (year) {
      filter.year = parseInt(year);
    }

    if (category) {
      filter.category = category;
    }

    const budgets = await Budget.find(filter)
      .populate('category', 'name type')
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      count: budgets.length,
      budgets: budgets,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single budget by ID
// @route   GET /api/budgets/:id
// @access  Private
const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('category', 'name type');

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Make sure user owns this budget
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this budget' });
    }

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const { amount, month, year } = req.body;

    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Make sure user owns this budget
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this budget' });
    }

    // Validation
    if (amount !== undefined && amount < 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' });
    }

    if (month !== undefined && (month < 1 || month > 12)) {
      return res.status(400).json({ message: 'Month must be between 1 and 12' });
    }

    // Update fields
    budget.amount = amount !== undefined ? amount : budget.amount;
    budget.month = month !== undefined ? month : budget.month;
    budget.year = year !== undefined ? year : budget.year;

    const updatedBudget = await budget.save();
    await updatedBudget.populate('category', 'name type');

    res.status(200).json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Make sure user owns this budget
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this budget' });
    }

    await budget.deleteOne();

    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get budget status (spent vs budget)
// @route   GET /api/budgets/:id/status
// @access  Private
const getBudgetStatus = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id).populate('category', 'name type');

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Make sure user owns this budget
    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this budget' });
    }

    // Calculate total spent for this category in the specified month/year
    const startDate = new Date(budget.year, budget.month - 1, 1);
    const endDate = new Date(budget.year, budget.month, 0, 23, 59, 59);

    const expenses = await Expense.find({
      user: req.user._id,
      category: budget.category._id,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = budget.amount - totalSpent;
    const percentageUsed = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

    res.status(200).json({
      budget: {
        _id: budget._id,
        category: budget.category,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
      },
      spent: totalSpent,
      remaining: remaining,
      percentageUsed: Math.round(percentageUsed * 100) / 100,
      isOverBudget: totalSpent > budget.amount,
      expenseCount: expenses.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all budget statuses for a specific month/year
// @route   GET /api/budgets/status/all
// @access  Private
const getAllBudgetStatuses = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Please provide month and year' });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Get all budgets for this month/year
    const budgets = await Budget.find({
      user: req.user._id,
      month: monthNum,
      year: yearNum,
    }).populate('category', 'name type');

    // Calculate status for each budget
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    const budgetStatuses = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await Expense.find({
          user: req.user._id,
          category: budget.category._id,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        });

        const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const remaining = budget.amount - totalSpent;
        const percentageUsed = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;

        return {
          budget: {
            _id: budget._id,
            category: budget.category,
            amount: budget.amount,
            month: budget.month,
            year: budget.year,
          },
          spent: totalSpent,
          remaining: remaining,
          percentageUsed: Math.round(percentageUsed * 100) / 100,
          isOverBudget: totalSpent > budget.amount,
          expenseCount: expenses.length,
        };
      })
    );

    res.status(200).json({
      month: monthNum,
      year: yearNum,
      count: budgetStatuses.length,
      budgets: budgetStatuses,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
  getAllBudgetStatuses,
};