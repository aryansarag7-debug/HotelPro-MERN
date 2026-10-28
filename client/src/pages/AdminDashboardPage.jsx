import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useBooking } from '../context/BookingContext';
import {
  Shield,
  Hotel,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Users,
  AlertCircle,
  X,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { showToast } = useBooking();

  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'bookings' | 'users'
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Room modal state
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    roomNumber: '',
    type: 'Deluxe',
    pricePerNight: '',
    capacity: 2,
    description: '',
    amenities: 'Free Wi-Fi, Air Conditioning, Room Service, Smart TV',
    isAvailable: true,
    image: '',
  });

  // Filter states
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');

  // Fetch admin stats, rooms, bookings, and users
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, roomsRes, bookingsRes, usersRes] = await Promise.all([
        api.get('/rooms/stats/summary'),
        api.get('/rooms'),
        api.get('/bookings'),
        api.get('/auth/users'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (roomsRes.data?.success) setRooms(roomsRes.data.rooms);
      if (bookingsRes.data?.success) setBookings(bookingsRes.data.bookings);
      if (usersRes.data?.success) setUsers(usersRes.data.users);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Error', 'Failed to retrieve administrative statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Room Modal Open / Edit
  const openAddRoomModal = () => {
    setEditingRoom(null);
    setRoomFormData({
      roomNumber: '',
      type: 'Deluxe',
      pricePerNight: '',
      capacity: 2,
      description: '',
      amenities: 'Free Wi-Fi, Air Conditioning, Room Service, Smart TV',
      isAvailable: true,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    });
    setRoomModalOpen(true);
  };

  const openEditRoomModal = (room) => {
    setEditingRoom(room);
    setRoomFormData({
      roomNumber: room.roomNumber,
      type: room.type,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity || 2,
      description: room.description || '',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      isAvailable: room.isAvailable,
      image: room.image,
    });
    setRoomModalOpen(true);
  };

  // Submit Room Add/Edit
  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        const res = await api.put(`/rooms/${editingRoom._id}`, roomFormData);
        if (res.data?.success) {
          showToast('Room Updated', `Room ${roomFormData.roomNumber} updated successfully`, 'success');
        }
      } else {
        const res = await api.post('/rooms', roomFormData);
        if (res.data?.success) {
          showToast('Room Created', `Room ${roomFormData.roomNumber} created successfully`, 'success');
        }
      }
      setRoomModalOpen(false);
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      showToast('Error', msg, 'error');
    }
  };

  // Delete Room
  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete Room ${roomNumber}? Any upcoming reservations will be cancelled.`)) {
      return;
    }
    try {
      const res = await api.delete(`/rooms/${roomId}`);
      if (res.data?.success) {
        showToast('Room Deleted', `Room ${roomNumber} deleted`, 'info');
        loadDashboardData();
      }
    } catch (err) {
      showToast('Error', err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  // Toggle Room Maintenance status
  const handleToggleRoomStatus = async (room) => {
    try {
      const res = await api.put(`/rooms/${room._id}`, {
        isAvailable: !room.isAvailable,
      });
      if (res.data?.success) {
        showToast(
          'Status Changed',
          `Room ${room.roomNumber} is now ${!room.isAvailable ? 'Available' : 'Under Maintenance'}`,
          'info'
        );
        loadDashboardData();
      }
    } catch (err) {
      showToast('Error', 'Failed to toggle room status', 'error');
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data?.success) {
        showToast('Booking Updated', `Reservation marked as ${newStatus}`, 'success');
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      showToast('Error', 'Failed to update booking status', 'error');
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus =
      bookingStatusFilter === 'All' || b.status === bookingStatusFilter.toLowerCase();
    const searchLower = bookingSearch.toLowerCase();
    const guestName = b.user?.name?.toLowerCase() || '';
    const guestEmail = b.user?.email?.toLowerCase() || '';
    const roomNum = b.room?.roomNumber?.toLowerCase() || '';
    const matchesSearch =
      !bookingSearch ||
      guestName.includes(searchLower) ||
      guestEmail.includes(searchLower) ||
      roomNum.includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  // Filter Rooms
  const filteredRooms = rooms.filter((r) => {
    const s = roomSearch.toLowerCase();
    return (
      !roomSearch ||
      r.roomNumber.toLowerCase().includes(s) ||
      r.type.toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-white">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Hotel Management Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics, inventory administration, and reservation ledger
          </p>
        </div>

        <button
          onClick={openAddRoomModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Suite
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Rooms</span>
            <Hotel className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats?.totalRooms ?? rooms.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-bold">{stats?.availableRooms ?? 0}</span> Available •{' '}
            <span className="text-amber-600 font-bold">{stats?.maintenanceRooms ?? 0}</span> Maintenance
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Active Bookings</span>
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats?.activeBookings ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.totalBookings ?? bookings.length} total lifetime bookings
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            ${stats?.totalRevenue?.toLocaleString() ?? 0}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Confirmed reservation earnings
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Occupancy Rate</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {stats?.occupancyRate ?? 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Current active capacity utilized
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'rooms'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Hotel className="w-4 h-4" /> Room Inventory ({rooms.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" /> All Reservations ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> User Accounts ({users.length})
        </button>
      </div>

      {/* TAB 1: ROOMS INVENTORY */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search room # or tier..."
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
            <div className="text-xs text-slate-500">
              Showing {filteredRooms.length} of {rooms.length} rooms
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Room</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Price / Night</th>
                    <th className="py-3.5 px-4">Capacity</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.map((room) => (
                    <tr key={room._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img
                          src={room.image}
                          alt={room.roomNumber}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            Room {room.roomNumber}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {room.description}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{room.type}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        ${room.pricePerNight}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{room.capacity || 2} Guests</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleRoomStatus(room)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            room.isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {room.isAvailable ? 'Available' : 'Maintenance'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditRoomModal(room)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Edit Room"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room._id, room.roomNumber)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Room"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL RESERVATIONS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest, email, room..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['All', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setBookingStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    bookingStatusFilter === status
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Guest</th>
                    <th className="py-3.5 px-4">Room</th>
                    <th className="py-3.5 px-4">Stay Dates</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.user?.name || 'Guest'}</div>
                        <div className="text-[10px] text-slate-400">{b.user?.email || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">Room {b.room?.roomNumber}</span>
                        <div className="text-[10px] text-slate-400">{b.room?.type}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(b.checkInDate).toLocaleDateString()} &rarr;{' '}
                        {new Date(b.checkOutDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        ${b.totalAmount}
                      </td>
                      <td className="py-3.5 px-4">
                        {b.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            Confirmed
                          </span>
                        ) : b.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={b.status}
                          onChange={(e) => handleUpdateBookingStatus(b._id, e.target.value)}
                          className="text-xs px-2 py-1 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{u.phone || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      {roomModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Accommodation'}
              </h3>
              <button
                onClick={() => setRoomModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 501"
                    value={roomFormData.roomNumber}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, roomNumber: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Type Tier
                  </label>
                  <select
                    value={roomFormData.type}
                    onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                    <option value="Family Suite">Family Suite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price Per Night ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="199"
                    value={roomFormData.pricePerNight}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, pricePerNight: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guest Capacity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={roomFormData.capacity}
                    onChange={(e) =>
                      setRoomFormData({ ...roomFormData, capacity: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Photo URL (Unsplash or CDN)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={roomFormData.image}
                  onChange={(e) => setRoomFormData({ ...roomFormData, image: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Free Wi-Fi, Air Conditioning, Balcony..."
                  value={roomFormData.amenities}
                  onChange={(e) => setRoomFormData({ ...roomFormData, amenities: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={roomFormData.description}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, description: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={roomFormData.isAvailable}
                  onChange={(e) =>
                    setRoomFormData({ ...roomFormData, isAvailable: e.target.checked })
                  }
                  className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                />
                <label htmlFor="availCheck" className="text-xs font-medium text-slate-700">
                  Ready & Available for Guest Reservations
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRoomModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {editingRoom ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
