# HotelPro - Luxury Hotel Booking & Management Platform

A complete, production-ready full-stack **MERN** web application engineered with clean monorepo architecture, real-time room availability checks, strict date-overlap double-booking prevention, guest booking flows, and an administrative control dashboard.

---

## 🚀 Tech Stack

* **Frontend:** React.js (Vite), React Router v6, Context API, Tailwind CSS, Lucide Icons, Axios.
* **Backend:** Node.js, Express.js RESTful API architecture.
* **Database:** MongoDB with Mongoose ODM (compound indexing, strict relational references).
* **Authentication:** JSON Web Tokens (JWT) & `bcryptjs` password hashing.

---

## 📁 Monorepo Folder Structure

```text
HotelPro-MERN/
├── client/                     # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── api/                # Axios instance with automated JWT bearer interceptors
│   │   ├── context/            # AuthContext (sessions) & BookingContext (filters & modals)
│   │   ├── components/         # Navbar, Footer, RoomCard, BookingModal, Toast, Route Guards
│   │   ├── pages/              # HomePage, RoomDetails, UserDashboard, AdminDashboard, Auth
│   │   ├── App.jsx             # Route definitions
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Tailwind styling directives
│   ├── index.html              # HTML shell
│   ├── vite.config.js          # Vite config with /api proxy to backend (:5000)
│   └── package.json            # Client dependencies
│
├── server/                     # Node.js + Express.js REST API
│   ├── config/                 # Resilient MongoDB database connection (db.js)
│   ├── controllers/            # authController, roomController, bookingController
│   ├── middleware/             # JWT authMiddleware (protect, adminOnly), errorHandler
│   ├── models/                 # Mongoose schemas: User, Room, Booking
│   ├── routes/                 # Express routers: authRoutes, roomRoutes, bookingRoutes
│   ├── seeder.js               # Database seeder (sample rooms, bookings, and demo accounts)
│   ├── server.js               # Express application entry & SPA production delivery
│   └── package.json            # Server dependencies
│
├── .env                        # Environment configurations (PORT, MONGO_URI, JWT_SECRET)
└── package.json                # Monorepo root scripts
```

---

## 🔑 Pre-Seeded Demo Accounts

You can log in manually or use the built-in **"1-Click Demo Login"** buttons directly on the Navbar or Login page:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@hotelpro.com` | `admin123` | Full Access: Room Inventory CRUD, Booking Ledger, User Directory, KPI Metrics |
| **Customer / Guest** | `customer@hotelpro.com` | `customer123` | Room Browsing, Live Date Filtering, Stays Booking, My Reservations, Cancellations |
| **Guest** | `guest@hotelpro.com` | `guest123` | Standard Guest privileges |

---

## ⚡ Quick Start Guide

### 1. Prerequisites
* Node.js (v18+)
* MongoDB running locally or a MongoDB Atlas URI

### 2. Configure Environment (`.env`)
The `.env` file is ready at the project root and in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hotelpro
JWT_SECRET=hotelpro_super_secure_production_secret_key_2026_jwt_token
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database
Populates 8 luxury accommodations, test users, and active reservations to demonstrate date-overlap detection immediately:
```bash
npm run seed
```

### 4. Run the Application

#### Option A: Unified Full-Stack Production Mode
Express will serve both the REST API and the compiled React SPA on port 5000:
```bash
npm run server
```
Then open: **`http://localhost:5000`**

#### Option B: Development Mode (Vite Hot-Reload)
Start the backend server and Vite frontend client concurrently:
```bash
# Terminal 1: Backend
npm run server:dev

# Terminal 2: Frontend
npm run client
```
Then open: **`http://localhost:5173`** (API requests automatically proxy to port 5000).

---

## 🛡️ Double-Booking Prevention Algorithm

Double bookings are strictly prohibited by date-overlap boundary validation:

$$\text{Conflict} \iff (\text{ExistingCheckIn} < \text{RequestedCheckOut}) \land (\text{ExistingCheckOut} > \text{RequestedCheckIn}) \land (\text{Status} = \text{'confirmed'})$$

When an overlap occurs, the API immediately halts execution, returning an **HTTP 409 Conflict** error with the exact overlapping dates and room details, preventing any race condition or database corruption.

---

## 📡 API Reference Overview

### Auth (`/api/auth`)
* `POST /api/auth/register` - Create customer or admin account.
* `POST /api/auth/login` - Authenticate credentials and receive signed JWT.
* `GET /api/auth/me` - Retrieve current user profile (Protected).
* `GET /api/auth/users` - Directory of all users (Admin only).

### Rooms (`/api/rooms`)
* `GET /api/rooms` - Query rooms with filters (`type`, `minPrice`, `maxPrice`, `search`, `checkInDate`, `checkOutDate`).
* `GET /api/rooms/:id` - Detailed view of room and booked date ranges.
* `POST /api/rooms` - Create accommodation (Admin only).
* `PUT /api/rooms/:id` - Update room details or toggle maintenance (Admin only).
* `DELETE /api/rooms/:id` - Remove room and cancel future bookings (Admin only).
* `GET /api/rooms/stats/summary` - Aggregate metrics: total rooms, occupancy, revenue (Admin only).

### Bookings (`/api/bookings`)
* `POST /api/bookings` - Create reservation with overlap guard (Protected).
* `GET /api/bookings/my` - Fetch authenticated user's reservations (Protected).
* `GET /api/bookings/:id` - Retrieve reservation receipt (Owner or Admin).
* `PUT /api/bookings/:id/cancel` - Cancel a reservation (Owner or Admin).
* `GET /api/bookings` - Master reservations ledger (Admin only).
* `PUT /api/bookings/:id/status` - Update status (`confirmed`, `cancelled`, `completed`) (Admin only).

---

## 🧪 Verification & Test Suites

* **Backend Unit & Endpoints Test:** `node server/test-endpoints.js`
* **Full-Stack E2E Integration Suite:** `node server/test-integration-e2e.js`
* **Client Vite Production Build:** `npm run client:build`
