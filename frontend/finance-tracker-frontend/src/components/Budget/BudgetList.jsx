import { useEffect, useState } from 'react';
import { budgetAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import BudgetForm from './BudgetForm';

const BudgetList = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const getMonthName = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1] || '';
  };

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
    fetchBudgetStatus();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const allCategories = response.data.categories || response.data || [];
      // Filter only expense categories (budgets are for expenses)
      const expenseCategories = allCategories.filter(cat => cat.type === 'expense');
      setCategories(expenseCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetAPI.getAll();
      setBudgets(response.data.budgets || response.data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budgets');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetStatus = async () => {
    try {
      const response = await budgetAPI.getStatus();
      if (Array.isArray(response.data)) {
        setBudgetStatus(response.data);
      } else if (Array.isArray(response.data.budgets)) {
        setBudgetStatus(response.data.budgets);
      } else {
        setBudgetStatus([]);
      }
    } catch (error) {
      console.error('Error fetching budget status:', error);
      // Don't show error toast for status - it's optional
      setBudgetStatus([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await budgetAPI.delete(id);
      toast.success('Budget deleted successfully');
      fetchBudgets();
      fetchBudgetStatus();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error(error.response?.data?.message || 'Failed to delete budget');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBudget(null);
    fetchBudgets();
    fetchBudgetStatus();
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (percentage) => {
    if (percentage >= 100) return 'Over Budget';
    if (percentage >= 80) return 'Warning';
    if (percentage >= 60) return 'On Track';
    return 'Good';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading Budgets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Budgets</h1>
          <p className="text-gray-600 mt-1">Set and track your spending limits</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          + Add Budget
        </button>
      </div>

      {/* Budget Form Modal */}
      {showForm && (
        <BudgetForm
          budget={editingBudget}
          categories={categories}
          onClose={handleFormClose}
        />
      )}

      {/* Budget Status Cards */}
      {budgetStatus.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Current Month Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetStatus.map((status) => {
              const percentage = (status.spent / status.limit) * 100;
              return (
                <div key={status._id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {status.category?.name || 'Unknown'}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                        percentage >= 100 ? 'bg-red-100 text-red-700' :
                        percentage >= 80 ? 'bg-orange-100 text-orange-700' :
                        percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {getStatusText(percentage)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-semibold text-gray-800">
                        ₹{status.spent.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Limit</span>
                      <span className="font-semibold text-gray-800">
                        ₹{status.limit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining</span>
                      <span className={`font-semibold ${status.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{Math.abs(status.remaining).toLocaleString('en-IN')}
                        {status.remaining < 0 && ' over'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(percentage)} transition-all duration-300`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 text-center mt-1">
                      {percentage.toFixed(1)}% used
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Budgets */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">All Budgets</h2>
        {budgets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">💼</div>
            <p className="text-gray-600 text-lg mb-2">No budgets yet</p>
            <p className="text-gray-500 text-sm">Create your first budget to track spending</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <div key={budget._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {budget.category?.name || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {budget.month && budget.year ? `${getMonthName(budget.month)} ${budget.year}` : 'Budget'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{budget.amount ? budget.amount.toLocaleString('en-IN') : '0'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Spending limit</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetList;