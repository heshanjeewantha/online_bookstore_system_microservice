import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBooks, getAllOrders } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApproval: 0,
    lowStockBooks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [booksRes, ordersRes] = await Promise.all([getBooks(), getAllOrders()]);
        const books = booksRes.data.books;
        const orders = ordersRes.data.orders || [];

        setStats({
          totalBooks: books.length,
          totalOrders: orders.length,
          totalRevenue: orders.reduce(
            (sum, order) => sum + (order.orderStatus !== 'cancelled' ? order.totalPrice : 0),
            0
          ),
          pendingApproval: orders.filter((order) => order.orderStatus === 'pending_approval').length,
          lowStockBooks: books.filter((book) => book.stock <= 5).length,
        });
      } catch (error) {
        console.error('Dashboard stats error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="border-l-4 border-brand-600 pl-4 text-3xl font-bold text-slate-800">
        Admin Dashboard
      </h1>
      <p className="mb-8 mt-2 text-slate-500">Catalog and order overview for the bookstore system.</p>

      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Books in Catalog</p>
          <p className="mt-4 text-4xl font-black text-brand-600">{stats.totalBooks}</p>
          <p className="mt-3 text-sm text-slate-500">{stats.lowStockBooks} titles currently need stock attention.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Total Orders</p>
          <p className="mt-4 text-4xl font-black text-slate-900">{stats.totalOrders}</p>
          <p className="mt-3 text-sm text-slate-500">Across all order statuses.</p>
        </div>
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">Pending Approval</p>
          <p className="mt-4 text-4xl font-black text-amber-600">{stats.pendingApproval}</p>
          <p className="mt-3 text-sm text-amber-600/70">Orders awaiting your review and approval.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Revenue</p>
          <p className="mt-4 text-4xl font-black text-emerald-600">Rs. {stats.totalRevenue.toLocaleString()}</p>
          <p className="mt-3 text-sm text-slate-500">From non-cancelled orders.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Manage Books', path: '/admin/books', helper: 'Create, edit, and remove catalog items.' },
          { label: 'Manage Orders', path: '/admin/orders', helper: 'Review, approve, and manage customer orders.' },
          { label: 'Manage Payments', path: '/admin/payments', helper: 'Track payment status and transaction history.' },
          { label: 'Manage Users', path: '/admin/users', helper: 'Inspect registered admins and customers.' },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
          >
            <p className="text-lg font-bold text-slate-900">{item.label}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{item.helper}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
