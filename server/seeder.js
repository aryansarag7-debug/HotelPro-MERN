import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Room from './models/Room.js';
import Booking from './models/Booking.js';

const sampleUsers = [
  {
    name: 'Hotel Administrator',
    email: 'admin@hotelpro.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 (555) 019-2831',
  },
  {
    name: 'Sarah Connor',
    email: 'customer@hotelpro.com',
    password: 'customer123',
    role: 'customer',
    phone: '+1 (555) 019-9482',
  },
  {
    name: 'Michael Scott',
    email: 'guest@hotelpro.com',
    password: 'guest123',
    role: 'guest',
    phone: '+1 (555) 019-4710',
  },
];

const sampleRooms = [
  {
    roomNumber: '101',
    type: 'Single',
    pricePerNight: 89,
    capacity: 1,
    description:
      'Cozy, ergonomic single room designed for solo business travelers or digital nomads. Features ergonomic workspace, super-fast Wi-Fi, and a plush twin pillow-top mattress.',
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Room Service', 'Work Desk', 'Coffee Maker'],
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    roomNumber: '102',
    type: 'Double',
    pricePerNight: 149,
    capacity: 2,
    description:
      'Chic contemporary double room featuring panoramic cityscape views, a queen-size luxury bed, premium marble bathroom, and automated climate control.',
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Room Service', 'City View'],
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    roomNumber: '201',
    type: 'Deluxe',
    pricePerNight: 249,
    capacity: 2,
    description:
      'Sophisticated ocean-facing deluxe room with a private sun-drenched balcony, California King bed, rainfall shower, and artisan welcome refreshments.',
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Balcony', 'Ocean View', 'Coffee Maker', 'Mini Bar', 'Luxury Robes'],
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    roomNumber: '202',
    type: 'Deluxe',
    pricePerNight: 279,
    capacity: 3,
    description:
      'Corner skyline deluxe accommodation boasting floor-to-ceiling windows, king bed plus sofa bed, spa-inspired en suite, and evening turndown service.',
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Bathtub', 'Skyline View', 'Espresso Bar'],
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    roomNumber: '301',
    type: 'Suite',
    pricePerNight: 399,
    capacity: 4,
    description:
      'Expansive junior suite featuring a dedicated master bedroom, living room salon with designer sectional, deep soaking jacuzzi tub, and Bose sound system.',
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Jacuzzi', 'Living Room', 'Mini Bar', 'Breakfast Included', 'Sound System'],
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    roomNumber: '302',
    type: 'Executive Suite',
    pricePerNight: 499,
    capacity: 4,
    description:
      'High-floor executive suite with private elevator access, 8-person conference/dining table, dual marble vanities, walk-in dressing wardrobe, and VIP lounge access.',
    amenities: ['Free Wi-Fi', 'VIP Lounge Access', 'Private Bar', 'Jacuzzi', 'Butler Service', 'Dining Area', 'Walk-in Closet'],
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    roomNumber: '401',
    type: 'Presidential Suite',
    pricePerNight: 899,
    capacity: 6,
    description:
      'The crown jewel of HotelPro. Ultra-luxurious penthouse suite encompassing 2,500 sq ft, private infinity terrace overlooking the ocean, private chef kitchen, and 24/7 dedicated butler.',
    amenities: ['Private Infinity Pool', '24/7 Butler Service', 'Chef Kitchen', 'Panoramic Ocean View', 'VIP Transport', 'Jacuzzi', 'Home Theater'],
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    roomNumber: '402',
    type: 'Family Suite',
    pricePerNight: 349,
    capacity: 5,
    description:
      'Spacious two-bedroom family sanctuary equipped with custom bunk beds for kids, king master bedroom, family entertainment hub, and child-safe private patio.',
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Two Bedrooms', 'Kids Entertainment Hub', 'Private Patio', 'Kitchenette'],
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Connected to MongoDB. Clearing existing collections...');

    await User.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();

    console.log('[Seeder] Creating users...');
    const createdUsers = [];
    for (const u of sampleUsers) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`[Seeder] Seeded ${createdUsers.length} users.`);

    console.log('[Seeder] Creating rooms...');
    const createdRooms = await Room.insertMany(sampleRooms);
    console.log(`[Seeder] Seeded ${createdRooms.length} rooms.`);

    console.log('[Seeder] Creating sample test bookings to demonstrate overlap detection...');
    const customer = createdUsers.find((u) => u.email === 'customer@hotelpro.com');
    const room101 = createdRooms.find((r) => r.roomNumber === '101');
    const room201 = createdRooms.find((r) => r.roomNumber === '201');

    // Create a confirmed booking for Room 101 spanning 5 days from today
    const checkIn1 = new Date();
    checkIn1.setDate(checkIn1.getDate() + 1);
    checkIn1.setHours(0, 0, 0, 0);

    const checkOut1 = new Date();
    checkOut1.setDate(checkOut1.getDate() + 4);
    checkOut1.setHours(0, 0, 0, 0);

    const nights1 = 3;
    await Booking.create({
      user: customer._id,
      room: room101._id,
      checkInDate: checkIn1,
      checkOutDate: checkOut1,
      totalAmount: nights1 * room101.pricePerNight,
      guestsCount: 1,
      status: 'confirmed',
      specialRequests: 'High floor preferred, arriving late evening.',
    });

    // Create a completed booking for Room 201 in the past
    const checkIn2 = new Date();
    checkIn2.setDate(checkIn2.getDate() - 10);
    checkIn2.setHours(0, 0, 0, 0);

    const checkOut2 = new Date();
    checkOut2.setDate(checkOut2.getDate() - 7);
    checkOut2.setHours(0, 0, 0, 0);

    await Booking.create({
      user: customer._id,
      room: room201._id,
      checkInDate: checkIn2,
      checkOutDate: checkOut2,
      totalAmount: 3 * room201.pricePerNight,
      guestsCount: 2,
      status: 'completed',
      specialRequests: 'Anniversary celebration arrangement.',
    });

    console.log('===========================================================');
    console.log('  HotelPro Database Seeding Complete!  ');
    console.log('===========================================================');
    console.log('  Admin User:     admin@hotelpro.com     / admin123');
    console.log('  Customer User:  customer@hotelpro.com  / customer123');
    console.log('  Guest User:     guest@hotelpro.com     / guest123');
    console.log(`  Sample Rooms:   ${createdRooms.length} luxury rooms seeded`);
    console.log('  Active Booking: Room 101 reserved from:');
    console.log(`                  ${checkIn1.toISOString().split('T')[0]} to ${checkOut1.toISOString().split('T')[0]}`);
    console.log('===========================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
