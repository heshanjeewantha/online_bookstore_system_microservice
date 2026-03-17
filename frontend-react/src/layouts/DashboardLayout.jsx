import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ type }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard Overview', path: '/admin', icon: '📊' },
    { name: 'Manage Books', path: '/admin/books', icon: '📚' },
    { name: 'Manage Orders', path: '/admin/orders', icon: '📦' },
    { name: 'User Management', path: '/admin/users', icon: '👥' },
  ];

  const userLinks = [
    { name: 'My Profile', path: '/dashboard', icon: '👤' },
    { name: 'Order History', path: '/dashboard/orders', icon: '🛍️' },
  ];

  const links = type === 'admin' ? adminLinks : userLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header (visible only on md:hidden) */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
         <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">PG</span>
              </div>
              <span className="text-slate-800 font-bold text-sm tracking-wide">Dashboard</span>
         </Link>
         <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-slate-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
         </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-800/60 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-40
        w-64 h-screen max-h-screen overflow-y-auto
        bg-white border-r border-slate-200 shadow-sm
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold">PG</span>
              </div>
              <div>
                <span className="block text-slate-800 font-bold tracking-wide">Bookstore</span>
                <span className="block text-slate-400 text-[10px] font-bold">DASHBOARD</span>
              </div>
          </Link>

          <nav className="flex flex-col gap-2 flex-1">
            {links.map((link) => {
              const isActive = location.pathname === link.path || (link.path !== '/admin' && link.path !== '/dashboard' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium
                    ${isActive 
                      ? 'bg-brand-50 text-brand-600 border border-brand-200 shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                  `}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-200">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold">
                 {user?.name?.charAt(0)}
              </div>
              <div className="overflow-hidden">
                 <p className="text-slate-800 text-sm font-semibold truncate">{user?.name}</p>
                 <p className="text-slate-500 text-xs truncate capitalize">{user?.role}</p>
              </div>
           </div>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
             <span>🚪</span> Logout
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 bg-slate-50 md:p-8 p-4 h-full relative overflow-y-auto">
          <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
