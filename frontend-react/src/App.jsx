import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts & Protection
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookDetailsPage from './pages/BookDetailsPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';

// User Dashboard
import UserProfile from './pages/user/UserProfile';
import UserOrders from './pages/user/UserOrders';

// Admin Dashboard
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBooks from './pages/admin/ManageBooks';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Layout */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/books" element={<HomePage />} /> {/* Filter handled in Home */}
              <Route path="/book/:id" element={<BookDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route path="/payment" element={
              <PrivateRoute>
                 <PaymentPage />
              </PrivateRoute>
            } />

            {/* User Dashboard Layout */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                 <DashboardLayout type="user" />
              </PrivateRoute>
            }>
              <Route index element={<UserProfile />} />
              <Route path="orders" element={<UserOrders />} />
            </Route>

            {/* Admin Dashboard Layout */}
            <Route path="/admin" element={
              <AdminRoute>
                 <DashboardLayout type="admin" />
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<ManageBooks />} />
              <Route path="orders" element={<ManageOrders />} />
              <Route path="users" element={<ManageUsers />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
