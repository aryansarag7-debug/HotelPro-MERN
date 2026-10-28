import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from '../server/config/db.js';
import User from '../server/models/User.js';
import Room from '../server/models/Room.js';
import Booking from '../server/models/Booking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importData() {
  try {
    await connectDB();
    console.log('[Import] Connected to MongoDB database');

    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      throw new Error(`Data directory not found at ${dataDir}`);
    }

    const usersPath = path.join(dataDir, 'users.json');
    const roomsPath = path.join(dataDir, 'rooms.json');
    const bookingsPath = path.join(dataDir, 'bookings.json');

    console.log('[Import] Cleaning existing collections...');
    await User.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();

    if (fs.existsSync(usersPath)) {
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      await User.insertMany(usersData);
      console.log(`[Import] Successfully imported ${usersData.length} users`);
    }

    if (fs.existsSync(roomsPath)) {
      const roomsData = JSON.parse(fs.readFileSync(roomsPath, 'utf8'));
      await Room.insertMany(roomsData);
      console.log(`[Import] Successfully imported ${roomsData.length} rooms`);
    }

    if (fs.existsSync(bookingsPath)) {
      const bookingsData = JSON.parse(fs.readFileSync(bookingsPath, 'utf8'));
      await Booking.insertMany(bookingsData);
      console.log(`[Import] Successfully imported ${bookingsData.length} bookings`);
    }

    console.log('===========================================================');
    console.log('  HotelPro Database Import Completed Successfully!         ');
    console.log('===========================================================');
    process.exit(0);
  } catch (error) {
    console.error('[Import Error]:', error);
    process.exit(1);
  }
}

importData();
