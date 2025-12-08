import { useEffect, useState } from 'react';
import { incomeAPI, categoryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import IncomeForm from './IncomeForm';
import IncomeItem from './IncomeItem';

const IncomeList = () => {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchIncomes();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const allCategories = response.data.categories || response.data || [];
      // Filter only income categories
      const incomeCategories = allCategories.filter(cat => cat.type === 'income');
      setCategories(incomeCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchIncomes = async () => {
  try {
    setLoading(true);
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    const response = await incomeAPI.getAll(params);
    
    // Check if incomes data exists and is an array
    if (response.data && Array.isArray(response.data.incomes)) {
      setIncomes(response.data.incomes);
    } else if (response.data && Array.isArray(response.data.income)) {
      setIncomes(response.data.income);
    } else if (Array.isArray(response.data)) {
      setIncomes(response.data);
    } else {
      setIncomes([]);
    }
  } catch (error) {
    console.error('Error fetching incomes:', error);
    toast.error('Failed to load income');
    setIncomes([]);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income?')) {
      return;
    }

    try {
      await incomeAPI.delete(id);
      toast.success('Income deleted successfully');
      fetchIncomes();
    } catch (error) {
      console.error('Error deleting income:', error);
      toast.error(error.response?.data?.message || 'Failed to delete income');
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingIncome(null);
    fetchIncomes();
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyFilters = () => {
    fetchIncomes();
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
    });
    setTimeout(() => fetchIncomes(), 0);
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading Income...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Income</h1>
          <p className="text-gray-600 mt-1">Track and manage your income</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          + Add Income
        </button>
      </div>

      {/* Income Form Modal */}
      {showForm && (
        <IncomeForm
          income={editingIncome}
          categories={categories}
          onClose={handleFormClose}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-green-100 border-2 border-green-300 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-1">Total Income</p>
            <p className="text-3xl font-bold text-green-700">
              ₹{totalIncome.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-5xl">💰</div>
        </div>
      </div>

      {/* Income List */}
      {incomes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-gray-600 text-lg mb-2">No income yet</p>
          <p className="text-gray-500 text-sm">Add your first income to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incomes.map((income) => (
            <IncomeItem
              key={income._id}
              income={income}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomeList;