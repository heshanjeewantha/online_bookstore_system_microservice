import { useState, useEffect } from 'react';
import { getBooks } from '../../mocks/books';
import { getOrders } from '../../mocks/orders';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
     totalBooks: 0,
     totalOrders: 0,
     totalRevenue: 0,
     pendingOrders: 0,
     lowStockBooks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
       try {
          const [booksRes, ordersRes] = await Promise.all([getBooks(), getOrders()]);
          const books = booksRes.data;
          const orders = ordersRes.data;
          
          setStats({
              totalBooks: books.length,
              totalOrders: orders.length,
              totalRevenue: orders.reduce((sum, order) => sum + (order.orderStatus !== 'cancelled' ? order.totalPrice : 0), 0),
              pendingOrders: orders.filter(o => o.orderStatus === 'pending').length,
              lowStockBooks: books.filter(b => b.stock <= 5).length,
          });
       } catch (err) {
          console.error("Dashboard stats error:", err);
       } finally {
          setLoading(false);
       }
    };
    fetchStats();
  }, []);

  if (loading) {
      return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
       <h1 className="text-3xl font-bold text-slate-800 mb-2 border-l-4 border-brand-600 pl-4">Admin Dashboard</h1>
       <p className="text-slate-500 mb-8 pl-5">System overview and quick statistics.</p>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           {/* Revenue Card */}
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md relative overflow-hidden group hover:border-emerald-300 transition-colors">
               <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">💰</div>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Revenue</p>
               <h3 className="text-3xl font-extrabold text-emerald-600">Rs. {stats.totalRevenue.toLocaleString()}</h3>
           </div>
           
           {/* Orders Card */}
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md relative overflow-hidden group hover:border-brand-300 transition-colors">
               <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">📦</div>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Orders</p>
               <h3 className="text-3xl font-extrabold text-brand-600 mb-2">{stats.totalOrders}</h3>
               {stats.pendingOrders > 0 && (
                  <span className="inline-block bg-amber-50 text-amber-600 text-xs px-2 py-0.5 rounded-md font-bold border border-amber-200">
                     {stats.pendingOrders} Pending
                  </span>
               )}
           </div>

           {/* Books Card */}
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md relative overflow-hidden group sm:col-span-2 lg:col-span-1 hover:border-brand-300 transition-colors">
               <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform">📚</div>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Books in Catalog</p>
               <h3 className="text-3xl font-extrabold text-brand-600 mb-2">{stats.totalBooks}</h3>
               {stats.lowStockBooks > 0 && (
                  <span className="inline-block bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-md font-bold border border-red-200">
                     {stats.lowStockBooks} Low Stock
                  </span>
               )}
           </div>
       </div>

       {/* Quick Actions / Getting Started */}
       <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">Quick Actions</h2>
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           {['Manage Books', 'Manage Orders', 'User Management'].map((action, i) => (
               <div key={i} className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 hover:border-brand-400 hover:shadow-md transition-all flex items-center justify-between cursor-pointer group">
                  <span className="text-slate-700 font-bold group-hover:text-brand-600 transition-colors">{action}</span>
                  <span className="text-brand-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
               </div>
           ))}
       </div>
    </div>
  );
};

export default AdminDashboard;
