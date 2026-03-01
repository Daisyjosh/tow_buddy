# 🏍 TowBuddy — Two-Wheeler Roadside Rescue Platform

A full-stack MERN application connecting stranded two-wheeler riders with nearby rescue helpers in real time.

---

## 📁 Project Structure

```
towbuddy/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # Express routes
│   │   ├── models/         # Mongoose models
│   │   ├── middleware/      # Auth, error handling
│   │   ├── utils/          # Helpers (fare, OTP, JWT)
│   │   ├── socket/         # Socket.io handler
│   │   ├── app.js          # Express app
│   │   └── server.js       # HTTP + Socket server
│   ├── .env.example
│   ├── package.json
│   └── render.yaml
│
└── frontend/
    ├── src/
    │   ├── pages/          # Login, Register, Dashboards
    │   ├── components/     # Reusable UI components
    │   ├── services/       # Axios API calls
    │   ├── context/        # Auth & Socket context
    │   ├── hooks/          # Custom hooks
    │   ├── utils/          # Helpers
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── vite.config.js
    ├── tailwind.config.js
    └── vercel.json
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Git

---

### 1. Clone / Extract the project

```bash
cd towbuddy
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/towbuddy
JWT_SECRET=supersecretkey123
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

Backend will run at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🚀 Deployment Instructions

### Backend → Render

1. Push backend folder to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node version**: 18
5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | PORT | 5000 |
   | MONGO_URI | mongodb+srv://... |
   | JWT_SECRET | your_secret_here |
   | CLIENT_URL | https://your-frontend.vercel.app |
6. Deploy → Copy the service URL (e.g. `https://towbuddy.onrender.com`)

---

### Frontend → Vercel

1. Push frontend folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | VITE_API_URL | https://towbuddy.onrender.com/api |
   | VITE_SOCKET_URL | https://towbuddy.onrender.com |
5. Deploy!

---

### Database → MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/towbuddy`
6. Use this as `MONGO_URI` in both local `.env` and Render env vars

---

## 🎮 How to Use

### As a Customer:
1. Register with role **Customer**
2. Go to **Customer Dashboard**
3. Click **Book Ride**
4. Select service type, vehicle type, number of rescuers
5. Click the map to set pickup location (green), then dropoff (red)
6. See fare estimate → Click **Request Rescue**
7. Wait for a rider to accept
8. When rider arrives, share the **OTP** displayed on screen
9. Ride starts after OTP verification

### As a Rider:
1. Register with role **Rider** (provide name, phone, vehicle type)
2. Go to **Rider Dashboard**
3. Click **Go Online** to start receiving requests
4. Accept pending rides shown in real time
5. Click **Mark as Arrived** when you reach the pickup
6. Enter the customer's 4-digit OTP to start the ride
7. Click **Complete Ride** when done
8. Earnings are automatically tracked

---

## 💡 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Styling | TailwindCSS |
| Maps | Leaflet + OpenStreetMap |
| HTTP Client | Axios |
| Routing | React Router DOM v6 |
| Notifications | React Hot Toast |
| Real-time | Socket.io |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Deployment (FE) | Vercel |
| Deployment (BE) | Render |

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Rides
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/rides | Create ride (customer) |
| POST | /api/rides/estimate | Fare estimate |
| GET | /api/rides/my | Customer ride history |
| GET | /api/rides/pending | Pending rides (rider) |
| GET | /api/rides/active | Rider's active ride |
| GET | /api/rides/:id | Get ride by ID |
| PATCH | /api/rides/:id/accept | Accept ride (rider) |
| PATCH | /api/rides/:id/arrived | Mark arrived (rider) |
| PATCH | /api/rides/:id/verify-otp | Verify OTP (rider) |
| PATCH | /api/rides/:id/complete | Complete ride (rider) |
| PATCH | /api/rides/:id/cancel | Cancel ride |

### Rider
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/rider/profile | Get rider profile |
| PUT | /api/rider/profile | Update profile |
| PATCH | /api/rider/toggle-online | Toggle online status |

---

## 🔄 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `new_ride` | Server → Riders | New pending ride |
| `ride_taken` | Server → Riders | Ride accepted by someone |
| `ride_accepted` | Server → Customer | Rider accepted the ride |
| `rider_arrived` | Server → Customer | Rider at pickup |
| `ride_started` | Server → Room | Ride in progress |
| `ride_completed` | Server → Room | Ride done |
| `ride_cancelled` | Server → Room | Ride cancelled |
| `join_ride` | Client → Server | Join ride room |
| `leave_ride` | Client → Server | Leave ride room |

---

## 💰 Fare Calculation

```
distance = haversine(pickup, dropoff) in km
base_fare = distance × ₹20
helper_charge = numberOfRiders === 2 ? ₹100 : 0
total = base_fare + helper_charge
```
