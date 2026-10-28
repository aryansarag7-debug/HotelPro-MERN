import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: [true, 'Room type is required'],
      trim: true,
      enum: {
        values: [
          'Single',
          'Double',
          'Deluxe',
          'Suite',
          'Executive Suite',
          'Presidential Suite',
          'Family Suite',
        ],
        message: '{VALUE} is not a supported room type',
      },
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price must be a positive number'],
    },
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [1, 'Capacity must be at least 1 guest'],
      default: 2,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    amenities: {
      type: [String],
      default: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Room Service'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      required: [true, 'Room image URL is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup and availability queries
roomSchema.index({ isAvailable: 1, type: 1, pricePerNight: 1 });

const Room = mongoose.model('Room', roomSchema);
export default Room;
