import { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getPendingPaymentCount } from '../services/api';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const profileMenuRef = useRef(null);

  const accountPath = user?.role === 'admin' ? '/admin' : '/dashboard';
  const accountLabel = user?.role === 'admin' ? 'Dashboard' : 'Profile';
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const isHomePage = location.pathname === '/';
  const heroNavActive = isHomePage && !isScrolled;

  const navWrapperClasses = heroNavActive
    ? 'bg-slate-950/95 border-b border-white/10 shadow-none'
    : 'bg-white/90 border-b border-slate-200 shadow-sm';
  const brandTitleClasses = heroNavActive
    ? 'text-white group-hover:text-brand-300'
    : 'text-slate-800 group-hover:text-brand-600';
  const brandSubtitleClasses = heroNavActive
    ? 'text-slate-400'
    : 'text-slate-500';
  const navLinkClasses = heroNavActive
    ? 'px-4 py-2 text-slate-200 hover:text-white rounded-lg hover:bg-white/5 transition-all text-sm font-medium'
    : 'px-4 py-2 text-slate-600 hover:text-brand-600 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium';
  const cartLinkClasses = heroNavActive
    ? 'relative p-2 text-slate-300 hover:text-white transition-colors mx-2'
    : 'relative p-2 text-slate-500 hover:text-brand-600 transition-colors mx-2';
  const dividerClasses = heroNavActive ? 'border-white/10' : 'border-slate-200';
  const profileButtonClasses = heroNavActive
    ? 'flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-white/5'
    : 'flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-slate-50';
  const avatarClasses = heroNavActive
    ? 'w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm border border-white/15 bg-white/10'
    : 'w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm border border-brand-200';
  const profileArrowClasses = heroNavActive ? 'text-slate-300' : 'text-slate-400';
  const loginClasses = heroNavActive
    ? 'text-sm py-1.5 px-4 rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10'
    : 'btn-secondary text-sm py-1.5 px-4 shadow-none';
  const mobileIconClasses = heroNavActive
    ? 'text-slate-300 hover:text-white'
    : 'text-slate-500 hover:text-slate-800';
  const mobileMenuClasses = heroNavActive
    ? 'md:hidden py-3 border-t border-white/10 bg-slate-950/95 flex flex-col gap-1'
    : 'md:hidden py-3 border-t border-slate-200 flex flex-col gap-1';
  const mobileLinkClasses = heroNavActive
    ? 'px-4 py-2 text-slate-200 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium'
    : 'px-4 py-2 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg text-sm font-medium';
  const mobileLogoutClasses = heroNavActive
    ? 'text-left px-4 py-2 text-red-300 hover:bg-white/5 rounded-lg text-sm font-medium'
    : 'text-left px-4 py-2 text-red-500 hover:bg-slate-50 rounded-lg text-sm font-medium';

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileMenuOpen(false);
    navigate('/login');
  };

  // Fetch pending payment count for notification badge
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (user && user.role !== 'admin') {
        try {
          const { data } = await getPendingPaymentCount();
          setPendingCount(data.count || 0);
        } catch {
          setPendingCount(0);
        }
      } else {
        setPendingCount(0);
      }
    };

    fetchPendingCount();
    // Refresh count when route changes (user might have just placed or viewed an order)
    const interval = setInterval(fetchPendingCount, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [user, location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!profileMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Books', path: '/books' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${navWrapperClasses}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">PG</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className={`font-bold text-base transition-colors ${brandTitleClasses}`}>
                  Online Bookstore
                </span>
                <span className={`text-[10px] font-semibold tracking-widest ${brandSubtitleClasses}`}>POTHAGEDARA</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map(link => (
                <Link key={link.name} to={link.path} className={navLinkClasses}>
                  {link.name}
                </Link>
              ))}

              {/* My Orders link (only for logged-in non-admin users) */}
              {user && user.role !== 'admin' && (
                <Link to="/dashboard/orders" className={`relative ${navLinkClasses}`}>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    My Orders
                    {pendingCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </span>
                </Link>
              )}

              {/* Cart Icon */}
              <Link to="/cart" className={cartLinkClasses}>
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
                <div ref={profileMenuRef} className={`relative ml-2 border-l pl-4 ${dividerClasses}`}>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={profileMenuOpen}
                    onClick={() => setProfileMenuOpen((open) => !open)}
                    className={profileButtonClasses}
                  >
                    <div className={avatarClasses}>
                      {userInitial}
                    </div>
                    <svg
                      className={`h-4 w-4 transition-transform duration-300 ${profileArrowClasses} ${profileMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div
                    className={`absolute right-0 top-full mt-3 w-44 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-300 ${profileMenuOpen
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-2 opacity-0'
                      }`}
                  >
                    <Link
                      to={accountPath}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-600"
                    >
                      {accountLabel}
                    </Link>
                    {user.role !== 'admin' && (
                      <Link
                        to="/dashboard/orders"
                        className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-600"
                      >
                        My Orders
                        {pendingCount > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-brand-600 text-[10px] font-bold text-white">
                            {pendingCount}
                          </span>
                        )}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`flex items-center gap-2 ml-2 border-l pl-4 ${dividerClasses}`}>
                  <Link to="/login" className={loginClasses}>Login</Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger & cart */}
            <div className="flex items-center gap-4 md:hidden">
              {/* Mobile My Orders with badge */}
              {user && user.role !== 'admin' && pendingCount > 0 && (
                <Link to="/dashboard/orders" className={`relative transition-colors ${mobileIconClasses}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {pendingCount}
                  </span>
                </Link>
              )}
              <Link to="/cart" className={`relative transition-colors ${mobileIconClasses}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                {getCartCount() > 0 && (
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-sm">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className={`p-2 rounded-lg transition-colors ${mobileIconClasses}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className={mobileMenuClasses}>
              {navLinks.map(link => (
                <Link key={link.name} to={link.path} onClick={() => setMenuOpen(false)} className={mobileLinkClasses}>{link.name}</Link>
              ))}
              {user ? (
                <>
                  {user.role !== 'admin' && (
                    <Link to="/dashboard/orders" onClick={() => setMenuOpen(false)} className={mobileLinkClasses}>
                      My Orders
                      {pendingCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-brand-600 text-[10px] font-bold text-white">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <Link to={accountPath} onClick={() => setMenuOpen(false)} className={mobileLinkClasses}>{accountLabel}</Link>
                  <button onClick={handleLogout} className={mobileLogoutClasses}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className={mobileLinkClasses}>Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className={heroNavActive ? 'px-4 py-2 text-brand-300 hover:bg-white/5 rounded-lg text-sm font-medium' : 'px-4 py-2 text-brand-600 hover:bg-slate-50 rounded-lg text-sm font-medium'}>Register</Link>
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
          <p className="text-slate-400 text-xs text-center border-t border-slate-100 pt-6">
            (c) {new Date().getFullYear()} PothaGedara. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
