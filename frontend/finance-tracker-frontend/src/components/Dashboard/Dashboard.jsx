import { useEffect, useState } from 'react';
import { reportAPI } from '../../services/api';
import toast from 'react-hot-toast';
import OverviewCards from './OverviewCards';
import RecentTransactions from './RecentTransactions';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary
      const summaryRes = await reportAPI.getSummary();
      setSummary(summaryRes.data);

      // Fetch recent transactions
      const transactionsRes = await reportAPI.getRecentTransactions({ limit: 10 });
      
      // Check if transactions data exists and is an array
      if (transactionsRes.data && Array.isArray(transactionsRes.data.transactions)) {
        setRecentTransactions(transactionsRes.data.transactions);
      } else if (Array.isArray(transactionsRes.data)) {
        setRecentTransactions(transactionsRes.data);
      } else {
        setRecentTransactions([]);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setRecentTransactions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Overview Cards */}
      <OverviewCards summary={summary} />

      {/* Recent Transactions */}
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
};

export default Dashboard;