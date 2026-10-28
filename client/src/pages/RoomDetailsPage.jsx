import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Check,
  Calendar,
  Sparkles,
  AlertCircle,
  Clock,
  Wifi,
  Tv,
  Coffee,
  Wind,
  Ban,
} from 'lucide-react';

const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast, openBookingModal } = useBooking();

  const [room, setRoom] = useState(null);
  const [bookedDateRanges, setBookedDateRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive booking box states
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/rooms/${id}`);
        if (res.data?.success) {
          setRoom(res.data.room);
          setBookedDateRanges(res.data.bookedDateRanges || []);

          // Set default dates: tomorrow to +3 days
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const checkout = new Date();
          checkout.setDate(checkout.getDate() + 4);

          setCheckInDate(tomorrow.toISOString().split('T')[0]);
          setCheckOutDate(checkout.toISOString().split('T')[0]);
        }
      } catch (err) {
        setError('Room details could not be found or retrieved.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">{error || 'Room not found'}</h2>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-sky-600 text-white text-xs font-bold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Calculate nights & price
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

  const handleDirectBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!isAuthenticated) {
      showToast('Authentication Required', 'Please sign in to complete your reservation.', 'warning');
      navigate('/login', { state: { from: `/rooms/${room._id}` } });
      return;
    }

    if (nights <= 0) {
      setBookingError('Check-out date must be at least one day after check-in date.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post('/bookings', {
        room: room._id,
        checkInDate,
        checkOutDate,
        guestsCount: Number(guestsCount),
      });

      if (res.data?.success) {
        showToast(
          'Reservation Confirmed!',
          `Room ${room.roomNumber} confirmed for ${nights} nights.`,
          'success'
        );
        navigate('/my-bookings');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Booking failed';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-sky-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Room Catalog
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Visual Gallery & Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="h-[420px] rounded-3xl overflow-hidden shadow-md border border-slate-200">
              <img
                src={room.image}
                alt={`Room ${room.roomNumber}`}
                className="w-full h-full object-cover"
              />
            </div>
            {room.images && room.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {room.images.map((img, i) => (
                  <div key={i} className="h-28 rounded-2xl overflow-hidden border border-slate-200">
                    <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Room Title & Features */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                    {room.type} Suite
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Room #{room.roomNumber}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  The {room.type} Experience
                </h1>
              </div>

              <div className="text-right">
                <div className="text-3xl font-extrabold text-sky-600">
                  ${room.pricePerNight}
                </div>
                <div className="text-xs text-slate-400">per night / taxes included</div>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-3 gap-4 text-center py-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Users className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-900">Up to {room.capacity} Guests</div>
                <div className="text-[10px] text-slate-600">Max Capacity</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-900">
                  {room.isAvailable ? 'Available' : 'Maintenance'}
                </div>
                <div className="text-[10px] text-slate-600">Operational Status</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-900">5-Star Luxury</div>
                <div className="text-[10px] text-slate-600">Service Rating</div>
              </div>
            </div>

            {/* Overview text */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Room Overview</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {room.description ||
                  'Indulge in unmatched comfort and elegance. Each suite at HotelPro is appointed with top-tier Italian bedding, automated climate controls, acoustically isolated architecture, and 24/7 room service.'}
              </p>
            </div>

            {/* Amenities Grid */}
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">Suite Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(room.amenities || []).map((amenity, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
                  >
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Reserved Intervals Note */}
            {bookedDateRanges.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Upcoming Confirmed Bookings For This Room:
                </div>
                <div className="space-y-1 mt-2">
                  {bookedDateRanges.map((range, idx) => (
                    <div key={idx} className="text-xs text-amber-800">
                      • {new Date(range.checkIn).toLocaleDateString()} to{' '}
                      {new Date(range.checkOut).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Reserve Your Stay</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Instant confirmation with zero booking fees
              </p>
            </div>

            {bookingError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleDirectBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  required
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guests
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

              {/* Price Breakdown */}
              {nights > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      ${room.pricePerNight} × {nights} night{nights > 1 ? 's' : ''}
                    </span>
                    <span>${totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Complimentary Concierge & Wi-Fi</span>
                    <span className="text-emerald-600 font-bold">$0</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total Cost</span>
                    <span className="text-sky-600 font-extrabold text-base">
                      ${totalAmount}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={bookingLoading || !room.isAvailable || nights <= 0}
                className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-95 ${
                  !room.isAvailable
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-sky-600 hover:bg-sky-700 shadow-sky-500/25'
                }`}
              >
                {bookingLoading
                  ? 'Confirming...'
                  : !room.isAvailable
                  ? 'Under Maintenance'
                  : `Book Now • $${totalAmount}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
