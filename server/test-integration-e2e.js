import 'dotenv/config';

const SERVER_URL = 'http://localhost:5000';
const API_URL = `${SERVER_URL}/api`;

async function runE2EValidation() {
  console.log('================================================================');
  console.log('  HotelPro Full-Stack E2E Integration & Verification Suite     ');
  console.log('================================================================');

  let adminToken = '';
  let customerToken = '';
  let customerUser = null;
  let testRoomId = null;
  let createdBookingId = null;
  let createdRoomId = null;

  // Step 1: Validate Server & SPA Delivery
  console.log('\n[Step 1] Validating Health Check & React SPA Delivery...');
  try {
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    if (!healthRes.ok || healthData.status !== 'healthy') {
      throw new Error(`Health check returned unexpected payload: ${JSON.stringify(healthData)}`);
    }
    console.log('  ✓ API Health Check: 200 OK -', healthData.service);

    const spaRes = await fetch(`${SERVER_URL}/`);
    const spaHtml = await spaRes.text();
    if (!spaRes.ok || !spaHtml.includes('HotelPro')) {
      throw new Error(`SPA root did not return valid HotelPro HTML document.`);
    }
    console.log('  ✓ React Client SPA: 200 OK - HTML bundle loaded successfully.');
  } catch (err) {
    console.error('  ✗ Step 1 Failed:', err.message);
    process.exit(1);
  }

  // Step 2: Customer Registration & Auth Flow
  console.log('\n[Step 2] Testing User Registration & Authentication...');
  const newEmail = `guest_${Date.now()}@hotelpro.com`;
  try {
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alexander Hamilton',
        email: newEmail,
        password: 'password123',
        role: 'customer',
        phone: '+1 (555) 234-5678',
      }),
    });
    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    customerToken = regData.token;
    customerUser = regData.user;
    console.log('  ✓ Customer Registration Succeeded for:', customerUser.email);

    // Test Login with newly registered customer
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, password: 'password123' }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      throw new Error(`Login failed with newly registered customer: ${JSON.stringify(loginData)}`);
    }
    console.log('  ✓ Customer Login Verified with Signed JWT Token.');
  } catch (err) {
    console.error('  ✗ Step 2 Failed:', err.message);
    process.exit(1);
  }

  // Step 3: Admin Authentication & Privilege Verification
  console.log('\n[Step 3] Testing Admin Authentication & RBAC...');
  try {
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hotelpro.com', password: 'admin123' }),
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginRes.ok || adminLoginData.user.role !== 'admin') {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
    }
    adminToken = adminLoginData.token;
    console.log('  ✓ Admin Login Verified. Role = admin.');

    // Verify non-admin gets 403 on protected admin endpoints
    const forbiddenRes = await fetch(`${API_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for customer, got: ${forbiddenRes.status}`);
    }
    console.log('  ✓ Security: Customer correctly blocked with HTTP 403 on Admin endpoints.');

    // Verify admin succeeds
    const usersRes = await fetch(`${API_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    if (!usersRes.ok || !Array.isArray(usersData.users)) {
      throw new Error(`Admin fetch users failed: ${JSON.stringify(usersData)}`);
    }
    console.log(`  ✓ Admin Authorization Succeeded. Users in directory: ${usersData.users.length}`);
  } catch (err) {
    console.error('  ✗ Step 3 Failed:', err.message);
    process.exit(1);
  }

  // Step 4: Catalog Browsing & Real-Time Availability Checking
  console.log('\n[Step 4] Testing Room Catalog & Real-Time Availability Checking...');
  try {
    const roomsRes = await fetch(`${API_URL}/rooms?type=Suite`);
    const roomsData = await roomsRes.json();
    if (!roomsRes.ok || !Array.isArray(roomsData.rooms)) {
      throw new Error(`Rooms catalog query failed: ${JSON.stringify(roomsData)}`);
    }
    console.log(`  ✓ Room Catalog Query: Found ${roomsData.rooms.length} Suites in catalog.`);

    // Pick room 202
    const allRoomsRes = await fetch(`${API_URL}/rooms`);
    const allRoomsData = await allRoomsRes.json();
    const suiteRoom = allRoomsData.rooms.find((r) => r.roomNumber === '202');
    if (!suiteRoom) throw new Error('Room 202 not found in catalog');
    testRoomId = suiteRoom._id;
    console.log(`  ✓ Selected Target Room: Room ${suiteRoom.roomNumber} (${suiteRoom.type}, $${suiteRoom.pricePerNight}/night)`);
  } catch (err) {
    console.error('  ✗ Step 4 Failed:', err.message);
    process.exit(1);
  }

  // Step 5: Guest Booking Flow & Date-Overlap Conflict Prevention
  console.log('\n[Step 5] Testing Guest Booking Flow & Double-Booking Prevention...');
  const checkIn = '2026-12-01';
  const checkOut = '2026-12-05';
  try {
    // 5A. Place initial reservation
    const bookRes = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        room: testRoomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestsCount: 2,
        specialRequests: 'Arriving by sea plane, quiet floor.',
      }),
    });
    const bookData = await bookRes.json();
    if (bookRes.status !== 201 || !bookData.booking) {
      throw new Error(`Initial booking failed: ${JSON.stringify(bookData)}`);
    }
    createdBookingId = bookData.booking._id;
    console.log(`  ✓ Initial Booking Confirmed: ID=${createdBookingId}, Total=$${bookData.booking.totalAmount}`);

    // 5B. Attempt Overlapping Reservation (Double-Booking Attempt)
    // Desired: 2026-12-03 to 2026-12-07 (overlaps with Dec 1 - Dec 5)
    const conflictRes = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        room: testRoomId,
        checkInDate: '2026-12-03',
        checkOutDate: '2026-12-07',
        guestsCount: 1,
      }),
    });
    const conflictData = await conflictRes.json();
    if (conflictRes.status !== 409) {
      throw new Error(`Double-booking test failed: Expected HTTP 409 Conflict, received ${conflictRes.status}: ${JSON.stringify(conflictData)}`);
    }
    console.log('  ✓ DOUBLE-BOOKING CONFLICT PREVENTED (HTTP 409 Conflict):');
    console.log('    Backend Message:', conflictData.message);

    // 5C. Check real-time catalog reflects isBookedForDates
    const availRes = await fetch(
      `${API_URL}/rooms?checkInDate=2026-12-02&checkOutDate=2026-12-04`
    );
    const availData = await availRes.json();
    const updatedRoom = availData.rooms.find((r) => r._id === testRoomId);
    if (!updatedRoom?.isBookedForDates) {
      throw new Error('Real-time availability did not flag isBookedForDates: true for conflicting room');
    }
    console.log('  ✓ Real-Time Availability Engine: Catalog dynamically flagged room as booked for requested dates.');
  } catch (err) {
    console.error('  ✗ Step 5 Failed:', err.message);
    process.exit(1);
  }

  // Step 6: User Reservations Dashboard & Cancellation
  console.log('\n[Step 6] Testing User Dashboard Ledger & Cancellation...');
  try {
    const myRes = await fetch(`${API_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const myData = await myRes.json();
    if (!myRes.ok || myData.bookings.length === 0) {
      throw new Error(`Could not retrieve user bookings: ${JSON.stringify(myData)}`);
    }
    console.log(`  ✓ Retrieved ${myData.bookings.length} reservations for customer.`);

    // Cancel reservation
    const cancelRes = await fetch(`${API_URL}/bookings/${createdBookingId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const cancelData = await cancelRes.json();
    if (!cancelRes.ok || cancelData.booking.status !== 'cancelled') {
      throw new Error(`Cancellation failed: ${JSON.stringify(cancelData)}`);
    }
    console.log('  ✓ Reservation Successfully Cancelled. Status = cancelled.');
  } catch (err) {
    console.error('  ✗ Step 6 Failed:', err.message);
    process.exit(1);
  }

  // Step 7: Admin Suite Management & Statistics
  console.log('\n[Step 7] Testing Admin Operations & Room Management...');
  try {
    // 7A. Create a new room
    const createRoomRes = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        roomNumber: 'PH-999',
        type: 'Presidential Suite',
        pricePerNight: 1299,
        capacity: 8,
        description: 'Bespoke rooftop sky-villa with private helipad transfer and infinity plunge pool.',
        amenities: ['Private Pool', 'Helipad Access', '24/7 Butler', 'Smart Wine Cellar'],
        isAvailable: true,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
      }),
    });
    const createRoomData = await createRoomRes.json();
    if (createRoomRes.status !== 201 || !createRoomData.room) {
      throw new Error(`Admin room creation failed: ${JSON.stringify(createRoomData)}`);
    }
    createdRoomId = createRoomData.room._id;
    console.log(`  ✓ Admin Room Created: ${createRoomData.room.roomNumber} (ID: ${createdRoomId})`);

    // 7B. Update the room (toggle maintenance)
    const updateRes = await fetch(`${API_URL}/rooms/${createdRoomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ isAvailable: false }),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok || updateData.room.isAvailable !== false) {
      throw new Error(`Admin room update failed: ${JSON.stringify(updateData)}`);
    }
    console.log('  ✓ Admin Room Updated: Maintenance mode enabled.');

    // 7C. Fetch Admin KPI summary
    const statsRes = await fetch(`${API_URL}/rooms/stats/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    if (!statsRes.ok || !statsData.stats) {
      throw new Error(`Admin stats summary failed: ${JSON.stringify(statsData)}`);
    }
    console.log('  ✓ Admin KPI Dashboard Stats Verified:');
    console.log(`    - Total Inventory: ${statsData.stats.totalRooms} rooms`);
    console.log(`    - Maintenance:     ${statsData.stats.maintenanceRooms} rooms`);
    console.log(`    - Total Bookings:  ${statsData.stats.totalBookings}`);
    console.log(`    - Gross Revenue:   $${statsData.stats.totalRevenue}`);
    console.log(`    - Occupancy Rate:  ${statsData.stats.occupancyRate}%`);

    // 7D. Delete test room
    const delRes = await fetch(`${API_URL}/rooms/${createdRoomId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const delData = await delRes.json();
    if (!delRes.ok) {
      throw new Error(`Admin room deletion failed: ${JSON.stringify(delData)}`);
    }
    console.log(`  ✓ Admin Room Deleted: ${createRoomData.room.roomNumber} cleaned up cleanly.`);
  } catch (err) {
    console.error('  ✗ Step 7 Failed:', err.message);
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log('🎉 HOTELPRO FULL-STACK E2E VALIDATION: 100% PASSED!');
  console.log('================================================================\n');
}

runE2EValidation();
