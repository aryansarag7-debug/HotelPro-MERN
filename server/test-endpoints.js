import 'dotenv/config';

const BASE_URL = 'http://localhost:5000/api';

async function testBackend() {
  console.log('--- Starting Backend Verification Suite ---');

  let adminToken = '';
  let customerToken = '';
  let customerUser = null;
  let testRoom = null;
  let createdBookingId = null;

  // 1. Test Admin Login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hotelpro.com', password: 'admin123' }),
    });
    const data = await res.json();
    if (!res.ok || !data.token || data.user.role !== 'admin') {
      throw new Error(`Admin login failed: ${JSON.stringify(data)}`);
    }
    adminToken = data.token;
    console.log('✅ Admin Login Successful: role =', data.user.role);
  } catch (err) {
    console.error('❌ Admin Login Error:', err.message);
    process.exit(1);
  }

  // 2. Test Customer Login
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'customer@hotelpro.com', password: 'customer123' }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(`Customer login failed: ${JSON.stringify(data)}`);
    }
    customerToken = data.token;
    customerUser = data.user;
    console.log('✅ Customer Login Successful: user =', data.user.name);
  } catch (err) {
    console.error('❌ Customer Login Error:', err.message);
    process.exit(1);
  }

  // 3. Test Auth Me
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const data = await res.json();
    if (!res.ok || data.user.email !== 'customer@hotelpro.com') {
      throw new Error(`Auth /me failed: ${JSON.stringify(data)}`);
    }
    console.log('✅ Protected /auth/me Verified for:', data.user.email);
  } catch (err) {
    console.error('❌ Auth /me Error:', err.message);
    process.exit(1);
  }

  // 4. Test Role Verification: Admin-only /auth/users
  try {
    // Should fail with 403 for Customer
    const customerRes = await fetch(`${BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    if (customerRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for customer, got ${customerRes.status}`);
    }
    console.log('✅ Role Enforcement Verified: Customer correctly received 403 Forbidden on Admin route');

    // Should succeed for Admin
    const adminRes = await fetch(`${BASE_URL}/auth/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminData = await adminRes.json();
    if (!adminRes.ok || !Array.isArray(adminData.users)) {
      throw new Error(`Admin fetch users failed: ${JSON.stringify(adminData)}`);
    }
    console.log(`✅ Admin Access Verified: Retrieved ${adminData.users.length} registered users`);
  } catch (err) {
    console.error('❌ Role Verification Error:', err.message);
    process.exit(1);
  }

  // 5. Test Room Catalog & Filters
  try {
    const res = await fetch(`${BASE_URL}/rooms?type=Deluxe`);
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.rooms)) {
      throw new Error(`Get rooms failed: ${JSON.stringify(data)}`);
    }
    console.log(`✅ Room Catalog Filter Verified: Found ${data.rooms.length} Deluxe rooms`);

    // Fetch Room 102 for booking test
    const allRes = await fetch(`${BASE_URL}/rooms`);
    const allData = await allRes.json();
    testRoom = allData.rooms.find((r) => r.roomNumber === '102');
    if (!testRoom) throw new Error('Room 102 not found in catalog');
    console.log(`✅ Catalog Inspection: Room 102 selected ($${testRoom.pricePerNight}/night)`);
  } catch (err) {
    console.error('❌ Room Catalog Error:', err.message);
    process.exit(1);
  }

  // 6. Test Booking Creation
  const bookingCheckIn = '2026-11-10';
  const bookingCheckOut = '2026-11-14';
  try {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        room: testRoom._id,
        checkInDate: bookingCheckIn,
        checkOutDate: bookingCheckOut,
        guestsCount: 2,
        specialRequests: 'Quiet room near elevator.',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.booking) {
      throw new Error(`Create booking failed: ${JSON.stringify(data)}`);
    }
    createdBookingId = data.booking._id;
    console.log(`✅ Booking Created Successfully: ID=${createdBookingId}, Total=$${data.booking.totalAmount}`);
  } catch (err) {
    console.error('❌ Create Booking Error:', err.message);
    process.exit(1);
  }

  // 7. CRITICAL: Test Double-Booking Prevention (Date Overlap Validation)
  try {
    // Attempt overlapping reservation: 2026-11-12 to 2026-11-16 (overlaps with 10th to 14th)
    const overlapRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        room: testRoom._id,
        checkInDate: '2026-11-12',
        checkOutDate: '2026-11-16',
        guestsCount: 1,
      }),
    });
    const overlapData = await overlapRes.json();
    if (overlapRes.status === 409) {
      console.log('✅ DOUBLE-BOOKING PREVENTION VERIFIED (HTTP 409 Conflict):');
      console.log('   Message:', overlapData.message);
    } else {
      throw new Error(`Expected 409 Conflict for double-booking, received ${overlapRes.status}: ${JSON.stringify(overlapData)}`);
    }
  } catch (err) {
    console.error('❌ Double Booking Prevention Failure:', err.message);
    process.exit(1);
  }

  // 8. Test User Reservations & Cancellation
  try {
    const myRes = await fetch(`${BASE_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const myData = await myRes.json();
    if (!myRes.ok || !Array.isArray(myData.bookings)) {
      throw new Error(`Get my bookings failed: ${JSON.stringify(myData)}`);
    }
    console.log(`✅ Customer Bookings Verified: Found ${myData.bookings.length} reservations`);

    // Cancel the booking
    const cancelRes = await fetch(`${BASE_URL}/bookings/${createdBookingId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const cancelData = await cancelRes.json();
    if (!cancelRes.ok || cancelData.booking.status !== 'cancelled') {
      throw new Error(`Cancel booking failed: ${JSON.stringify(cancelData)}`);
    }
    console.log('✅ Booking Cancellation Verified: Status updated to cancelled');
  } catch (err) {
    console.error('❌ Booking Cancellation Error:', err.message);
    process.exit(1);
  }

  // 9. Test Admin Summary Stats
  try {
    const statsRes = await fetch(`${BASE_URL}/rooms/stats/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = await statsRes.json();
    if (!statsRes.ok || !statsData.stats) {
      throw new Error(`Admin stats summary failed: ${JSON.stringify(statsData)}`);
    }
    console.log('✅ Admin Analytics Summary Verified:');
    console.log('   Total Rooms:', statsData.stats.totalRooms);
    console.log('   Active Bookings:', statsData.stats.activeBookings);
    console.log('   Total Revenue: $' + statsData.stats.totalRevenue);
  } catch (err) {
    console.error('❌ Admin Stats Error:', err.message);
    process.exit(1);
  }

  console.log('===========================================================');
  console.log('🎉 ALL BACKEND ENDPOINTS & VALIDATIONS PASSED WITH 100% SUCCESS!');
  console.log('===========================================================');
}

testBackend();
