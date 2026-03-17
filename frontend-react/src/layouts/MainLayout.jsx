import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Books', path: '/books' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">PG</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-slate-800 font-bold text-base group-hover:text-brand-600 transition-colors">
                  Online Bookstore
                </span>
                <span className="text-slate-500 text-[10px] font-semibold tracking-widest">POTHAGEDARA</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map(link => (
                <Link key={link.name} to={link.path} className="px-4 py-2 text-slate-600 hover:text-brand-600 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium">
                  {link.name}
                </Link>
              ))}

              {/* Cart Icon */}
              <Link to="/cart" className="relative p-2 text-slate-500 hover:text-brand-600 transition-colors mx-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                {getCartCount() > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-sm">
                    {getCartCount()}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="px-4 py-2 text-slate-600 hover:text-brand-600 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium">
                    Profile/Orders
                  </Link>
                  <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm border border-brand-200">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-4">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 ml-2 border-l border-slate-200 pl-4">
                  <Link to="/login" className="btn-secondary text-sm py-1.5 px-4 shadow-none">Login</Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger & cart */}
            <div className="flex items-center gap-4 md:hidden">
              <Link to="/cart" className="relative text-slate-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                {getCartCount() > 0 && (
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-sm">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden py-3 border-t border-slate-200 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link key={link.name} to={link.path} onClick={() => setMenuOpen(false)} className="px-4 py-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg text-sm font-medium">{link.name}</Link>
              ))}
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMenuOpen(false)} className="px-4 py-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg text-sm font-medium">Profile/Orders</Link>
                  <button onClick={handleLogout} className="text-left px-4 py-2 text-red-500 hover:bg-slate-50 rounded-lg text-sm font-medium">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg text-sm font-medium">Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-brand-600 hover:bg-slate-50 rounded-lg text-sm font-medium">Register</Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
             <div className="mb-4">
               <span className="text-slate-800 font-bold text-lg">PothaGedara</span>
               <span className="text-slate-400 font-bold text-sm tracking-wide">.LK</span>
             </div>
             <p className="text-slate-500 text-sm mb-6">Online Bookstore Demo App.</p>
             <p className="text-slate-400 text-xs text-center border-t border-slate-100 pt-6">
                 © {new Date().getFullYear()} PothaGedara. All rights reserved.
             </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
