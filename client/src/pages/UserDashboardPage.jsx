import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import {
  CalendarCheck,
  CalendarX,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Hotel,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useBooking();

  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      if (res.data?.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load my bookings', err);
      showToast('Error', 'Unable to load reservations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancelBooking = async (bookingId, roomNumber) => {
    if (!window.confirm(`Are you sure you wish to cancel your reservation for Room ${roomNumber}?`)) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}/cancel`);
      if (res.data?.success) {
        showToast('Reservation Cancelled', `Booking for Room ${roomNumber} has been cancelled.`, 'warning');
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to cancel booking';
      showToast('Cancellation Error', msg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings =
    filterStatus === 'All'
      ? bookings
      : bookings.filter((b) => b.status === filterStatus.toLowerCase());

  const activeCount = bookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-3xl p-8 mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-600/30 border border-sky-400/40 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
          <div className="text-center px-3 border-r border-white/10">
            <div className="text-xl font-extrabold text-white">{bookings.length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-300">Total</div>
          </div>
          <div className="text-center px-3 border-r border-white/10">
            <div className="text-xl font-extrabold text-emerald-400">{activeCount}</div>
            <div className="text-[10px] uppercase font-bold text-slate-300">Active</div>
          </div>
          <div className="text-center px-3">
            <div className="text-xl font-extrabold text-rose-400">{cancelledCount}</div>
            <div className="text-[10px] uppercase font-bold text-slate-300">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Main Reservation Section */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Stay Reservations</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your confirmed hotel bookings and review stay records
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['All', 'Confirmed', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center my-6">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No reservations found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You currently do not have any {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} bookings registered.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl hover:bg-sky-700 transition-colors"
            >
              Browse Luxury Rooms <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const checkIn = new Date(b.checkInDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const checkOut = new Date(b.checkOutDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const diffNights = Math.max(
                1,
                Math.round(
                  Math.abs(new Date(b.checkOutDate) - new Date(b.checkInDate)) /
                    (1000 * 60 * 60 * 24)
                )
              );

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  {/* Left: Thumbnail & Room Title */}
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        b.room?.image ||
                        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={b.room?.roomNumber}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-100"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-base">
                          Room {b.room?.roomNumber || 'N/A'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                          {b.room?.type || 'Suite'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>
                          {checkIn} &rarr; {checkOut}
                        </span>
                        <span>•</span>
                        <span>{diffNights} Night{diffNights > 1 ? 's' : ''}</span>
                      </div>
                      {b.specialRequests && (
                        <div className="text-[11px] text-slate-600 italic mt-1">
                          "{b.specialRequests}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Pricing, Status & Actions */}
                  <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-slate-900">
                        ${b.totalAmount}
                      </div>
                      <div className="text-[10px] text-slate-600">Total Paid</div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {b.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                        </span>
                      ) : b.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                          <Clock className="w-3.5 h-3.5" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      )}
                    </div>

                    {/* Cancel action */}
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelBooking(b._id, b.room?.roomNumber)}
                        disabled={cancellingId === b._id}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                      >
                        {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboardPage;
