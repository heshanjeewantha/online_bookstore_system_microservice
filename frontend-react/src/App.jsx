import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import UserAccountLayout from './layouts/UserAccountLayout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailsPage from './pages/BookDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfile from './pages/user/UserProfile';
import UserOrders from './pages/user/UserOrders';
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
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/book/:id" element={<BookDetailsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={(
                  <PrivateRoute>
                    <UserAccountLayout />
                  </PrivateRoute>
                )}
              >
                <Route index element={<UserProfile />} />
                <Route path="orders" element={<UserOrders />} />
              </Route>
            </Route>

            <Route
              path="/admin"
              element={(
                <AdminRoute>
                  <DashboardLayout type="admin" />
                </AdminRoute>
              )}
            >
              <Route index element={<AdminDashboard />} />
              <Route path="books" element={<ManageBooks />} />
              <Route path="orders" element={<ManageOrders />} />
              <Route path="users" element={<ManageUsers />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
