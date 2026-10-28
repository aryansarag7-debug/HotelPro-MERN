import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import RoomCard from '../components/RoomCard';
import api from '../api/axios';
import {
  Search,
  Calendar,
  Users,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Hotel,
  ShieldCheck,
  Check,
} from 'lucide-react';

const ROOM_TYPES = [
  'All',
  'Single',
  'Double',
  'Deluxe',
  'Suite',
  'Executive Suite',
  'Presidential Suite',
  'Family Suite',
];

const HomePage = () => {
  const { searchParams, updateSearchParams, clearFilters } = useBooking();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch rooms with applied query parameters
  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchParams.type && searchParams.type !== 'All') {
        params.type = searchParams.type;
      }
      if (searchParams.search) {
        params.search = searchParams.search;
      }
      if (searchParams.minPrice) {
        params.minPrice = searchParams.minPrice;
      }
      if (searchParams.maxPrice) {
        params.maxPrice = searchParams.maxPrice;
      }
      if (searchParams.checkInDate && searchParams.checkOutDate) {
        params.checkInDate = searchParams.checkInDate;
        params.checkOutDate = searchParams.checkOutDate;
      }

      const res = await api.get('/rooms', { params });
      if (res.data?.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.error('Fetch rooms error:', err);
      setError('Could not load room catalog. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [
    searchParams.type,
    searchParams.minPrice,
    searchParams.maxPrice,
    searchParams.checkInDate,
    searchParams.checkOutDate,
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80"
            alt="Hotel Luxury Resort"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Redefining 5-Star Luxury Hospitality</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Escape to Pure Elegance at{' '}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              HotelPro
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Reserve premier ocean suites, executive penthouses, and bespoke accommodations with instantaneous availability and zero double-booking assurance.
          </p>

          {/* Quick Search Floating Banner */}
          <div className="mt-10 max-w-5xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 text-slate-800 border border-slate-100">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {/* Check-In */}
              <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" /> Check-In
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={searchParams.checkInDate}
                  onChange={(e) => updateSearchParams({ checkInDate: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none"
                />
              </div>

              {/* Check-Out */}
              <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" /> Check-Out
                </label>
                <input
                  type="date"
                  min={searchParams.checkInDate || new Date().toISOString().split('T')[0]}
                  value={searchParams.checkOutDate}
                  onChange={(e) => updateSearchParams({ checkOutDate: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none"
                />
              </div>

              {/* Room Tier */}
              <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <Hotel className="w-3.5 h-3.5 text-sky-600" /> Room Class
                </label>
                <select
                  value={searchParams.type}
                  onChange={(e) => updateSearchParams({ type: e.target.value })}
                  className="w-full text-xs font-medium text-slate-800 bg-transparent focus:outline-none"
                >
                  {ROOM_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t} {t !== 'All' ? 'Tier' : 'Categories'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <div className="flex items-center">
                <button
                  type="submit"
                  className="w-full h-full min-h-[46px] bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  Check Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filter Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Filter Bar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Featured Accommodations
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {rooms.length} available suites matching your stay criteria
            </p>
          </div>

          {/* Search by Room / Keywords */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search room, amenities..."
                value={searchParams.search}
                onChange={(e) => updateSearchParams({ search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchRooms()}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <button
              onClick={clearFilters}
              title="Reset all filters"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills & Price Slider */}
        <div className="py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {ROOM_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => updateSearchParams({ type })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  searchParams.type === type
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Price Range inputs */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Price:</span>
            <input
              type="number"
              placeholder="Min $"
              value={searchParams.minPrice}
              onChange={(e) => updateSearchParams({ minPrice: e.target.value })}
              className="w-20 px-2 py-1 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs bg-white"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              placeholder="Max $"
              value={searchParams.maxPrice}
              onChange={(e) => updateSearchParams({ maxPrice: e.target.value })}
              className="w-20 px-2 py-1 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs bg-white"
            />
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse p-4 space-y-4"
              >
                <div className="bg-slate-200 h-44 rounded-xl w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-200 my-8">
            <p className="text-sm text-rose-700 font-medium">{error}</p>
            <button
              onClick={fetchRooms}
              className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
            >
              Try Again
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 my-8 p-8">
            <Hotel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No rooms match your filter criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your price range, clearing selected dates, or switching room categories.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl hover:bg-sky-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
