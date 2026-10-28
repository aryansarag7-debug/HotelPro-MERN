import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import {
  Hotel,
  Shield,
  CalendarCheck,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Sparkles,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();
  const { showToast } = useBooking();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Signed Out', 'You have been successfully logged out.', 'info');
    navigate('/');
  };

  const handleQuickLogin = async (email, password, roleLabel) => {
    setDemoDropdownOpen(false);
    const result = await login(email, password);
    if (result.success) {
      showToast('Quick Login', `Authenticated as ${roleLabel} (${email})`, 'success');
      if (email.includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      showToast('Login Failed', result.message, 'error');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-sky-950 to-sky-700 bg-clip-text text-transparent">
                Hotel<span className="text-sky-600">Pro</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest font-semibold text-slate-600 -mt-1">
                Luxury Suites & Resorts
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Browse Rooms
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-bookings"
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isActive('/my-bookings')
                    ? 'text-sky-600 bg-sky-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-sky-500" />
                My Reservations
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isActive('/admin')
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Login Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-800 border border-amber-300/60 hover:bg-amber-500/20 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Logins</span>
                <ChevronDown className="w-3 h-3 ml-0.5 text-amber-600" />
              </button>

              {demoDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setDemoDropdownOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100">
                    Instant Switch Demo Role
                  </div>
                  <button
                    onClick={() => handleQuickLogin('admin@hotelpro.com', 'admin123', 'Administrator')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 flex items-center justify-between text-slate-700 hover:text-amber-900 group"
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        Admin Demo
                      </div>
                      <div className="text-[10px] text-slate-600">admin@hotelpro.com</div>
                    </div>
                    <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('customer@hotelpro.com', 'customer123', 'Customer')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 flex items-center justify-between text-slate-700 hover:text-sky-900 group"
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        Customer Demo
                      </div>
                      <div className="text-[10px] text-slate-600">customer@hotelpro.com</div>
                    </div>
                    <span className="text-[10px] font-medium bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                      Customer
                    </span>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('guest@hotelpro.com', 'guest123', 'Guest')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between text-slate-700 hover:text-slate-900 group"
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-600" />
                        Guest Demo
                      </div>
                      <div className="text-[10px] text-slate-600">guest@hotelpro.com</div>
                    </div>
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
                      Guest
                    </span>
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center border border-sky-200">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-900 max-w-[120px] truncate">
                      {user?.name}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-sky-600">
                      {user?.role}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Rooms
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              My Reservations
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-amber-700 bg-amber-50"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{user?.name}</div>
                  <div className="text-xs text-sky-600 uppercase font-semibold">{user?.role}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 rounded-lg font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 bg-sky-600 rounded-lg text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
