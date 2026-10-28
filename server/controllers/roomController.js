import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

// @desc    Get all rooms with optional filters and real-time date availability checking
// @route   GET /api/rooms
// @access  Public
export const getRooms = async (req, res, next) => {
  try {
    const { type, minPrice, maxPrice, search, checkInDate, checkOutDate } = req.query;

    const query = {};

    // Filter by type
    if (type && type !== 'All') {
      query.type = type;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    // Keyword search across roomNumber, type, or amenities
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { roomNumber: regex },
        { type: regex },
        { description: regex },
        { amenities: { $in: [regex] } },
      ];
    }

    let rooms = await Room.find(query).sort({ roomNumber: 1 });

    // If checkInDate and checkOutDate are specified, calculate real-time availability
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        // Find confirmed bookings that overlap with requested range:
        // checkInDate < requestedCheckOut AND checkOutDate > requestedCheckIn
        const overlappingBookings = await Booking.find({
          status: 'confirmed',
          checkInDate: { $lt: end },
          checkOutDate: { $gt: start },
        }).select('room');

        const bookedRoomIds = new Set(
          overlappingBookings.map((b) => b.room.toString())
        );

        rooms = rooms.map((room) => {
          const roomObj = room.toObject();
          roomObj.isBookedForDates = bookedRoomIds.has(room._id.toString());
          return roomObj;
        });
      }
    }

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
export const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Fetch active bookings for this room so client can visually disable booked dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeBookings = await Booking.find({
      room: room._id,
      status: 'confirmed',
      checkOutDate: { $gte: today },
    }).select('checkInDate checkOutDate');

    res.status(200).json({
      success: true,
      room,
      bookedDateRanges: activeBookings.map((b) => ({
        checkIn: b.checkInDate,
        checkOut: b.checkOutDate,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new room (Admin only)
// @route   POST /api/rooms
// @access  Private (Admin)
export const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, type, pricePerNight, capacity, description, amenities, isAvailable, image, images } =
      req.body;

    if (!roomNumber || !type || pricePerNight === undefined || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomNumber, type, pricePerNight, and image URL',
      });
    }

    const existingRoom = await Room.findOne({
      roomNumber: roomNumber.toString().trim().toUpperCase(),
    });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room number ${roomNumber} already exists in the system`,
      });
    }

    const room = await Room.create({
      roomNumber: roomNumber.toString().trim().toUpperCase(),
      type,
      pricePerNight: Number(pricePerNight),
      capacity: capacity ? Number(capacity) : 2,
      description: description || '',
      amenities: Array.isArray(amenities)
        ? amenities
        : (amenities ? amenities.split(',').map((s) => s.trim()) : undefined),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      image,
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json({
      success: true,
      message: `Room ${room.roomNumber} created successfully`,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room details (Admin only)
// @route   PUT /api/rooms/:id
// @access  Private (Admin)
export const updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // If roomNumber is being changed, verify uniqueness
    if (req.body.roomNumber && req.body.roomNumber.toUpperCase() !== room.roomNumber) {
      const duplicate = await Room.findOne({
        roomNumber: req.body.roomNumber.trim().toUpperCase(),
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Room number ${req.body.roomNumber} is already taken`,
        });
      }
    }

    if (req.body.amenities && typeof req.body.amenities === 'string') {
      req.body.amenities = req.body.amenities.split(',').map((s) => s.trim());
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} updated successfully`,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a room (Admin only)
// @route   DELETE /api/rooms/:id
// @access  Private (Admin)
export const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Cancel all future bookings for this room
    await Booking.updateMany(
      { room: room._id, status: 'confirmed' },
      { status: 'cancelled' }
    );

    await room.deleteOne();

    res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} and its upcoming reservations have been removed`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for Admin
// @route   GET /api/rooms/stats/summary
// @access  Private (Admin)
export const getRoomStats = async (req, res, next) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ isAvailable: true });
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Calculate total revenue from confirmed bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Room type breakdown
    const typeDistribution = await Room.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRooms,
        availableRooms,
        maintenanceRooms: totalRooms - availableRooms,
        totalBookings,
        activeBookings,
        cancelledBookings,
        totalRevenue,
        occupancyRate: totalRooms > 0 ? Math.round((activeBookings / totalRooms) * 100) : 0,
        typeDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};
