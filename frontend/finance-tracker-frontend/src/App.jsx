import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import CategoryList from './components/Categories/CategoryList';
import ExpenseList from './components/Expenses/ExpenseList';
import IncomeList from './components/Income/IncomeList';
import Reports from './components/Reports/Reports';
import BudgetList from './components/Budget/BudgetList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <div>
                    <Navbar />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/expenses" element={<ExpenseList />} />
                        <Route path="/income" element={<IncomeList />} />
                        <Route path="/categories" element={<CategoryList />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/budgets" element={<BudgetList />} />
                      </Routes>
                    </div>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;