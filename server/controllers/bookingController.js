import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

// @desc    Create a new room booking (with strict date-overlap double-booking prevention)
// @route   POST /api/bookings
// @access  Private (Authenticated users)
export const createBooking = async (req, res, next) => {
  try {
    const { room: roomId, checkInDate, checkOutDate, guestsCount, specialRequests } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide room ID, checkInDate, and checkOutDate',
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Validate dates
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out date format',
      });
    }

    // Standardize to midnight for exact date boundary comparisons
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past',
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be at least one day after check-in date',
      });
    }

    // Find the requested room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: `Room ${room.roomNumber} is currently undergoing maintenance and unavailable for booking`,
      });
    }

    // CRITICAL REQUIREMENT: Strict Date-Overlap Check to Prevent Double-Booking
    // Overlap condition:
    // Existing checkIn < Requested checkOut AND Existing checkOut > Requested checkIn
    const conflictingBooking = await Booking.findOne({
      room: room._id,
      status: 'confirmed',
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    });

    if (conflictingBooking) {
      const conflictStart = conflictingBooking.checkInDate.toISOString().split('T')[0];
      const conflictEnd = conflictingBooking.checkOutDate.toISOString().split('T')[0];
      return res.status(409).json({
        success: false,
        message: `Double booking prevented: Room ${room.roomNumber} is already booked from ${conflictStart} to ${conflictEnd}. Please select alternative dates or another room.`,
      });
    }

    // Calculate duration in nights and total price
    const diffTime = Math.abs(checkOut - checkIn);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room.pricePerNight;

    // Create reservation record
    const booking = await Booking.create({
      user: req.user._id,
      room: room._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalAmount,
      guestsCount: guestsCount ? Number(guestsCount) : 1,
      specialRequests: specialRequests || '',
      status: 'confirmed',
    });

    await booking.populate('room', 'roomNumber type pricePerNight image amenities');
    await booking.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: `Reservation confirmed for Room ${room.roomNumber} (${nights} night${nights > 1 ? 's' : ''})`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's reservations
// @route   GET /api/bookings/my
// @access  Private (User)
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room', 'roomNumber type pricePerNight image amenities capacity')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single reservation by ID
// @route   GET /api/bookings/:id
// @access  Private (Owner or Admin)
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Ensure authorized access (owner or admin)
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a reservation
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Owner or Admin)
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room', 'roomNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Ensure authorized access
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this booking',
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking for Room ${booking.room?.roomNumber || ''} has been successfully cancelled`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings across the hotel (Admin only)
// @route   GET /api/bookings
// @access  Private (Admin)
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    let query = Booking.find(filter)
      .populate('room', 'roomNumber type pricePerNight image')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const bookings = await query;

    // Filter by search term on client or server side
    let filteredBookings = bookings;
    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      filteredBookings = bookings.filter((b) => {
        const guestName = b.user?.name?.toLowerCase() || '';
        const guestEmail = b.user?.email?.toLowerCase() || '';
        const roomNum = b.room?.roomNumber?.toLowerCase() || '';
        return guestName.includes(term) || guestEmail.includes(term) || roomNum.includes(term);
      });
    }

    res.status(200).json({
      success: true,
      count: filteredBookings.length,
      bookings: filteredBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (Admin only)
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be confirmed, cancelled, or completed',
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('room', 'roomNumber')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};
