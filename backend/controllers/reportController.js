const Expense = require('../models/Expense');
const Income = require('../models/Income');

// Get overall summary
exports.getSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Calculate total income
    const totalIncomeResult = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Calculate total expenses
    const totalExpensesResult = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].total : 0;
    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;

    res.json({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    });
  } catch (error) {
    console.error('Error in getSummary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get expenses grouped by category
exports.getExpensesByCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    // Build match query
    const matchQuery = { user: userId };
    
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const expensesByCategory = await Expense.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    console.log('Expenses by category:', expensesByCategory); // Debug log
    res.json(expensesByCategory);
  } catch (error) {
    console.error('Error in getExpensesByCategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get income grouped by category
exports.getIncomeByCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    // Build match query
    const matchQuery = { user: userId };
    
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const incomeByCategory = await Income.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    console.log('Income by category:', incomeByCategory); // Debug log
    res.json(incomeByCategory);
  } catch (error) {
    console.error('Error in getIncomeByCategory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get monthly summary (income vs expenses)
exports.getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    // Build match query
    const matchQuery = { user: userId };
    
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    // Get monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalExpenses: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Get monthly income
    const monthlyIncome = await Income.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalIncome: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Merge income and expenses by month
    const monthMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    monthlyExpenses.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      const monthName = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      monthMap[key] = {
        month: monthName,
        totalExpenses: item.totalExpenses,
        totalIncome: 0,
      };
    });

    monthlyIncome.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      const monthName = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      if (monthMap[key]) {
        monthMap[key].totalIncome = item.totalIncome;
      } else {
        monthMap[key] = {
          month: monthName,
          totalExpenses: 0,
          totalIncome: item.totalIncome,
        };
      }
    });

    const monthlySummary = Object.values(monthMap);
    console.log('Monthly summary:', monthlySummary); // Debug log
    res.json(monthlySummary);
  } catch (error) {
    console.error('Error in getMonthlySummary:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recent transactions
exports.getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent expenses
    const recentExpenses = await Expense.find({ user: userId })
      .populate('category', 'name')
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    // Get recent income
    const recentIncome = await Income.find({ user: userId })
      .populate('category', 'name')
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    // Add type field and combine
    const expenses = recentExpenses.map((exp) => ({ ...exp, type: 'expense' }));
    const income = recentIncome.map((inc) => ({ ...inc, type: 'income' }));

    // Merge and sort by date
    const allTransactions = [...expenses, ...income].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Return only the requested limit
    res.json(allTransactions.slice(0, limit));
  } catch (error) {
    console.error('Error in getRecentTransactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};