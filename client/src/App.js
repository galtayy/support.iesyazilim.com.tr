import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';

// Support Ticket Pages
import TicketList from './pages/tickets/TicketList';
import CreateTicket from './pages/tickets/CreateTicket';
import EditTicket from './pages/tickets/EditTicket';
import TicketDetails from './pages/tickets/TicketDetails';

// Customer Pages
import CustomerList from './pages/customers/CustomerList';
import CreateCustomer from './pages/customers/CreateCustomer';
import EditCustomer from './pages/customers/EditCustomer';

// Category Pages
import CategoryList from './pages/categories/CategoryList';
import CreateCategory from './pages/categories/CreateCategory';
import EditCategory from './pages/categories/EditCategory';

// User Management Pages
import UserList from './pages/users/UserList';
import CreateUser from './pages/users/CreateUser';
import EditUser from './pages/users/EditUser';

// Report Pages
import Reports from './pages/reports/Reports';
import MonthlySummary from './pages/reports/MonthlySummary';
import DetailedReport from './pages/reports/DetailedReport';
import StaffPerformance from './pages/reports/StaffPerformance';

// Approval Pages
import TicketApproval from './pages/approval/TicketApproval';

// Protected Route Component
const ProtectedRoute = ({ element, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // If still loading auth state, show loading
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Yükleniyor...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role is required and user doesn't have it, show unauthorized
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-danger">Yetkisiz Erişim</h1>
        <p className="mt-2 text-gray-600">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
        <button 
          onClick={() => window.history.back()} 
          className="mt-4 btn btn-primary"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  // If all checks pass, render the protected element
  return element;
};

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Public Routes */}
      <Route path="/ticket-approval/:token/:action" element={<TicketApproval />} />

      {/* Main App Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
        
        {/* Ticket Routes */}
        <Route path="/tickets" element={<ProtectedRoute element={<TicketList />} />} />
        <Route path="/tickets/new" element={<ProtectedRoute element={<CreateTicket />} />} />
        <Route path="/tickets/create" element={<ProtectedRoute element={<CreateTicket />} />} />
        <Route path="/tickets/:id" element={<ProtectedRoute element={<TicketDetails />} />} />
        <Route path="/tickets/:id/edit" element={<ProtectedRoute element={<EditTicket />} />} />
        
        {/* Customer Routes - Admin Only */}
        <Route path="/customers" element={<ProtectedRoute element={<CustomerList />} requiredRole="admin" />} />
        <Route path="/customers/create" element={<ProtectedRoute element={<CreateCustomer />} requiredRole="admin" />} />
        <Route path="/customers/:id/edit" element={<ProtectedRoute element={<EditCustomer />} requiredRole="admin" />} />
        
        {/* Category Routes - Admin Only */}
        <Route path="/categories" element={<ProtectedRoute element={<CategoryList />} requiredRole="admin" />} />
        <Route path="/categories/create" element={<ProtectedRoute element={<CreateCategory />} requiredRole="admin" />} />
        <Route path="/categories/:id/edit" element={<ProtectedRoute element={<EditCategory />} requiredRole="admin" />} />
        
        {/* User Routes - Admin Only */}
        <Route path="/users" element={<ProtectedRoute element={<UserList />} requiredRole="admin" />} />
        <Route path="/users/create" element={<ProtectedRoute element={<CreateUser />} requiredRole="admin" />} />
        <Route path="/users/:id/edit" element={<ProtectedRoute element={<EditUser />} requiredRole="admin" />} />
        
        {/* Report Routes - Admin Only */}
        <Route path="/reports" element={<ProtectedRoute element={<Reports />} requiredRole="admin" />} />
        <Route path="/reports/monthly" element={<ProtectedRoute element={<MonthlySummary />} requiredRole="admin" />} />
        <Route path="/reports/detailed" element={<ProtectedRoute element={<DetailedReport />} requiredRole="admin" />} />
        <Route path="/reports/staff" element={<ProtectedRoute element={<StaffPerformance />} requiredRole="admin" />} />
      </Route>

      {/* Catch All Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;