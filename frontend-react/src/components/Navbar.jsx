import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">PG</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-base group-hover:text-brand-400 transition-colors">
                PothaGedara
              </span>
              <span className="text-gold-500 text-[10px] font-semibold tracking-widest">.LK</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className="px-4 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="px-4 py-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium">
                  Profile
                </Link>
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-300 text-sm font-medium">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-4">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-800 flex flex-col gap-1">
            <Link to="/" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm">Home</Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm">Profile</Link>
                <button onClick={handleLogout} className="text-left px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg text-sm">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2 text-brand-400 hover:bg-gray-800 rounded-lg text-sm">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
