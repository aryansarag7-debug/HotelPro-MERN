import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import api from '../api/axios';
import { X, Calendar, Users, DollarSign, AlertCircle, CheckCircle, Sparkles, LogIn } from 'lucide-react';

const BookingModal = () => {
  const { selectedRoomForBooking, closeBookingModal, showToast } = useBooking();
  const { isAuthenticated, user, login } = useAuth();
  const navigate = useNavigate();

  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default dates: tomorrow to +3 days
  useEffect(() => {
    if (selectedRoomForBooking) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const afterTomorrow = new Date();
      afterTomorrow.setDate(afterTomorrow.getDate() + 3);

      setCheckInDate(tomorrow.toISOString().split('T')[0]);
      setCheckOutDate(afterTomorrow.toISOString().split('T')[0]);
      setGuestsCount(1);
      setSpecialRequests('');
      setError('');
    }
  }, [selectedRoomForBooking]);

  if (!selectedRoomForBooking) return null;

  const room = selectedRoomForBooking;

  // Calculate nights & total
  let nights = 0;
  let totalAmount = 0;
  if (checkInDate && checkOutDate) {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (!isNaN(start) && !isNaN(end) && end > start) {
      const diff = Math.abs(end - start);
      nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
      totalAmount = nights * room.pricePerNight;
    }
  }

  const handleQuickLogin = async (email, password) => {
    setError('');
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      setError('Please log in to finalize your hotel reservation.');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setError('Please choose both check-in and check-out dates.');
      return;
    }

    if (nights <= 0) {
      setError('Check-out date must be at least one day after check-in date.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/bookings', {
        room: room._id,
        checkInDate,
        checkOutDate,
        guestsCount: Number(guestsCount),
        specialRequests,
      });

      if (res.data?.success) {
        showToast(
          'Reservation Confirmed!',
          `Room ${room.roomNumber} booked for ${nights} night${nights > 1 ? 's' : ''} ($${totalAmount}).`,
          'success'
        );
        closeBookingModal();
        navigate('/my-bookings');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to complete booking';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Confirm Reservation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Room {room.roomNumber} • {room.type}
            </p>
          </div>
          <button
            onClick={closeBookingModal}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Preview Strip */}
        <div className="px-6 py-4 bg-sky-50/50 border-b border-sky-100 flex items-center gap-4">
          <img
            src={room.image}
            alt={room.roomNumber}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-sky-200"
          />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 truncate">
              {room.type} Suite
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
              <span>${room.pricePerNight} / night</span>
              <span>•</span>
              <span>Max {room.capacity} Guests</span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Unauthenticated Quick-Login Prompt */}
        {!isAuthenticated && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Sign In Required to Reserve
            </div>
            <p className="text-xs text-amber-700 mb-3">
              You must be logged in to book. Use our 1-click test button or regular login:
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@hotelpro.com', 'customer123')}
                className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                1-Click Customer Login
              </button>
              <button
                type="button"
                onClick={() => {
                  closeBookingModal();
                  navigate('/login');
                }}
                className="py-1.5 px-3 border border-amber-300 text-amber-800 hover:bg-amber-100/50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Check-in Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Check-out Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Number of Guests
            </label>
            <select
              value={guestsCount}
              onChange={(e) => setGuestsCount(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {Array.from({ length: room.capacity || 2 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Guest{i > 0 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Special Requests (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Quiet floor, early arrival, extra pillows..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            ></textarea>
          </div>

          {/* Pricing Calculation Summary */}
          {nights > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>
                  ${room.pricePerNight} × {nights} night{nights > 1 ? 's' : ''}
                </span>
                <span>${totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Resort Hospitality Fee</span>
                <span className="text-emerald-600 font-semibold">Included</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Amount</span>
                <span className="text-sky-600 font-extrabold text-base">
                  ${totalAmount}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeBookingModal}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || nights <= 0 || !isAuthenticated}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                loading || nights <= 0 || !isAuthenticated
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-sky-600 hover:bg-sky-700 hover:shadow-sky-500/25 active:scale-95'
              }`}
            >
              {loading ? 'Confirming...' : `Confirm & Pay $${totalAmount}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
