import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { Hotel, Lock, Mail, AlertCircle, Sparkles, Shield, User, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const { showToast } = useBooking();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectTarget = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      showToast('Welcome Back!', `Signed in as ${res.user.name}`, 'success');
      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword, label) => {
    setError('');
    setLoading(true);
    const res = await login(demoEmail, demoPassword);
    setLoading(false);

    if (res.success) {
      showToast('Demo Login Active', `Authenticated as ${label}`, 'success');
      if (redirectTarget) {
        navigate(redirectTarget);
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-600/30">
            <Hotel className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to HotelPro
          </h2>
          <p className="text-xs text-slate-500">
            Access your reservations and manage bookings
          </p>
        </div>

        {/* Demo Fast Logins Section */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>1-Click Test Access:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@hotelpro.com', 'admin123', 'Administrator')}
              className="p-2 rounded-xl bg-white border border-amber-300 text-left hover:bg-amber-100/50 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Admin Demo
              </div>
              <div className="text-[10px] text-slate-500 truncate">admin@hotelpro.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('customer@hotelpro.com', 'customer123', 'Customer')}
              className="p-2 rounded-xl bg-white border border-sky-300 text-left hover:bg-sky-50 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
                <User className="w-3.5 h-3.5 text-sky-600" />
                Customer Demo
              </div>
              <div className="text-[10px] text-slate-500 truncate">customer@hotelpro.com</div>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-sky-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
