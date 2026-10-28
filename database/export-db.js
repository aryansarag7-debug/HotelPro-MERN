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

async function exportData() {
  try {
    await connectDB();
    console.log('[Export] Connected to MongoDB');

    const outputDir = path.join(__dirname, 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const users = await User.find().select('+password');
    const rooms = await Room.find();
    const bookings = await Booking.find();

    fs.writeFileSync(
      path.join(outputDir, 'users.json'),
      JSON.stringify(users, null, 2),
      'utf8'
    );
    console.log(`[Export] Saved ${users.length} users to users.json`);

    fs.writeFileSync(
      path.join(outputDir, 'rooms.json'),
      JSON.stringify(rooms, null, 2),
      'utf8'
    );
    console.log(`[Export] Saved ${rooms.length} rooms to rooms.json`);

    fs.writeFileSync(
      path.join(outputDir, 'bookings.json'),
      JSON.stringify(bookings, null, 2),
      'utf8'
    );
    console.log(`[Export] Saved ${bookings.length} bookings to bookings.json`);

    console.log('Database export completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Export Error]:', error);
    process.exit(1);
  }
}

exportData();
