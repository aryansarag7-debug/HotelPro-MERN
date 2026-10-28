# HotelPro - Live Deployment & Hosting Guide

This guide explains step-by-step how to take this project package and make it live on the web.

---

## 🚀 Option 1: Render.com / Railway (Easiest & Free)

Both **Render** and **Railway** allow you to deploy the unified full-stack Node.js + React application in minutes.

### Step 1: Create a Free MongoDB Database (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g., `hoteladmin` and password).
4. Under **Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** -> **Connect your application** (Drivers) and copy your connection string:
   ```text
   mongodb+srv://hoteladmin:<password>@cluster0.mongodb.net/hotelpro?retryWrites=true&w=majority
   ```

### Step 2: Deploy to Render.com
1. Unzip the project and push it to a new GitHub repository, or upload the code.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** -> **Web Service**.
3. Connect your GitHub repository (or select public repo).
4. Configure service settings:
   - **Name:** `hotelpro`
   - **Environment:** `Node`
   - **Build Command:** `npm run install:all && npm run client:build`
   - **Start Command:** `npm run server`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGO_URI` = *(Your MongoDB Atlas connection string from Step 1)*
   - `JWT_SECRET` = `hotelpro_production_secret_key_2026_super_secure`
   - `JWT_EXPIRES_IN` = `7d`
6. Click **Deploy Web Service**!
7. Once deployed, open the Render URL (e.g., `https://hotelpro.onrender.com`).
8. Run the database seed to populate rooms & users:
   - In the Render Shell tab, run:
     ```bash
     npm run seed
     ```
   - All rooms, demo accounts, and test bookings are now live!

---

## 🐳 Option 2: Docker / Docker Compose (Any VPS, DigitalOcean, AWS, Linode)

The project includes a ready-to-run `Dockerfile` and `docker-compose.yml`.

1. Upload the project folder to your VPS server.
2. Start the full stack (Node app + MongoDB) with one command:
   ```bash
   docker-compose up -d --build
   ```
3. Seed the database inside the container:
   ```bash
   docker exec -it hotelpro-web npm run seed
   ```
4. Access your live application at `http://YOUR_SERVER_IP:5000`.

---

## 💻 Option 3: Manual Deployment on Linux VPS (Ubuntu)

```bash
# 1. Install Node.js 20 & PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# 2. Extract project files & install
unzip HotelPro-Production.zip
cd HotelPro-MERN
npm run install:all
npm run client:build

# 3. Configure .env with your MongoDB Atlas connection string
nano .env

# 4. Seed database
npm run seed

# 5. Start with PM2 daemon
pm2 start server/server.js --name "hotelpro"
pm2 save
pm2 startup
```

---

## 🔑 Default Administrator & Customer Credentials

Once deployed, log in with:
* **Administrator:** `admin@hotelpro.com` / `admin123`
* **Customer:** `customer@hotelpro.com` / `customer123`
* **Guest:** `guest@hotelpro.com` / `guest123`
