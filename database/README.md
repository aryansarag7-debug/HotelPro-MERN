# HotelPro Database Backups & Data Schemas

This folder contains pre-configured MongoDB database dumps and migration scripts for the **HotelPro** platform.

## 📁 Contents
* `data/users.json`: Registered test administrator, customer, and guest accounts (with secure bcrypt hashes).
* `data/rooms.json`: 8 luxury accommodations with full amenities, HD photos, and pricing.
* `data/bookings.json`: Sample confirmed and completed reservations.
* `import-db.js`: Automated script to populate any MongoDB instance (local or MongoDB Atlas).
* `export-db.js`: Automated script to export the current database state to JSON.

---

## ⚡ How to Import into MongoDB Atlas or Local MongoDB

### Option 1: Automated Script (Recommended)
Make sure your `.env` file has your `MONGO_URI` set (e.g., your MongoDB Atlas connection string):
```bash
node database/import-db.js
```
or via npm:
```bash
npm run db:import
```

### Option 2: Using MongoDB Compass (GUI)
1. Open **MongoDB Compass** and connect to your database cluster.
2. Create or select the `hotelpro` database.
3. For each collection (`users`, `rooms`, `bookings`):
   - Click **Add Data** -> **Import JSON or CSV**.
   - Select the respective file from `database/data/`.
   - Click **Import**.

### Option 3: Using `mongoimport` CLI
```bash
mongoimport --uri="YOUR_MONGO_URI" --collection=users --file=database/data/users.json --jsonArray
mongoimport --uri="YOUR_MONGO_URI" --collection=rooms --file=database/data/rooms.json --jsonArray
mongoimport --uri="YOUR_MONGO_URI" --collection=bookings --file=database/data/bookings.json --jsonArray
```
