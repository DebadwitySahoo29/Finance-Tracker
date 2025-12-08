import { useEffect, useState } from 'react';
import { reportAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
  try {
    setLoading(true);
    
    const params = getDateParams();

    // Fetch all report data
    const [summaryRes, expensesRes, incomeRes, monthlyRes] = await Promise.all([
      reportAPI.getSummary(),
      reportAPI.getExpensesByCategory(params),
      reportAPI.getIncomeByCategory(params),
      reportAPI.getMonthlySummary(params),
    ]);

    setSummary(summaryRes.data);
    
    // Handle expenses by category
    if (Array.isArray(expensesRes.data)) {
      setExpensesByCategory(expensesRes.data);
    } else if (Array.isArray(expensesRes.data.data)) {
      setExpensesByCategory(expensesRes.data.data);
    } else {
      setExpensesByCategory([]);
    }
    
    // Handle income by category
    if (Array.isArray(incomeRes.data)) {
      setIncomeByCategory(incomeRes.data);
    } else if (Array.isArray(incomeRes.data.data)) {
      setIncomeByCategory(incomeRes.data.data);
    } else {
      setIncomeByCategory([]);
    }
    
    // Handle monthly summary
    if (Array.isArray(monthlyRes.data)) {
      setMonthlySummary(monthlyRes.data);
    } else if (Array.isArray(monthlyRes.data.data)) {
      setMonthlySummary(monthlyRes.data.data);
    } else {
      setMonthlySummary([]);
    }

  } catch (error) {
    console.error('Error fetching reports:', error);
    toast.error('Failed to load reports');
    // Set empty arrays on error
    setExpensesByCategory([]);
    setIncomeByCategory([]);
    setMonthlySummary([]);
  } finally {
    setLoading(false);
  }
};

  const getDateParams = () => {
    const params = {};
    const now = new Date();
    
    if (timeRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      params.startDate = startOfMonth.toISOString().split('T')[0];
    } else if (timeRange === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      params.startDate = startOfYear.toISOString().split('T')[0];
    }
    
    return params;
  };

  const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'];

  const balance = (summary?.totalIncome || 0) - (summary?.totalExpenses || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading Reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-600 mt-1">Visualize your financial data</p>
        </div>
        
        {/* Time Range Filter */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="all">All Time</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-100 border-2 border-green-300 rounded-xl p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Income</p>
          <p className="text-3xl font-bold text-green-700">
            ₹{(summary?.totalIncome || 0).toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6">
          <p className="text-gray-600 text-sm font-medium mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-red-700">
            ₹{(summary?.totalExpenses || 0).toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className={`${balance >= 0 ? 'bg-blue-100 border-blue-300' : 'bg-orange-100 border-orange-300'} border-2 rounded-xl p-6`}>
          <p className="text-gray-600 text-sm font-medium mb-1">Net Balance</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            ₹{balance.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category - Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Expenses by Category</h2>
          {expensesByCategory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No expense data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  dataKey="totalAmount"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry._id}: ₹${entry.totalAmount.toLocaleString('en-IN')}`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Income by Category - Pie Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Income by Category</h2>
          {incomeByCategory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No income data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  dataKey="totalAmount"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry._id}: ₹${entry.totalAmount.toLocaleString('en-IN')}`}
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly Summary - Bar Chart */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Summary</h2>
        {monthlySummary.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No monthly data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlySummary}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Bar dataKey="totalIncome" fill="#10B981" name="Income" />
              <Bar dataKey="totalExpenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Reports;