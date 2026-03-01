🏍 TowBuddy — Real-Time Two-Wheeler Roadside Rescue Platform

<p align="left">
  <img src="https://skillicons.dev/icons?i=react,vite,nodejs,express,mongodb,vercel" />
</p>

A production-deployed full-stack MERN application connecting stranded two-wheeler riders with nearby rescue partners in real time.

🔴 Live Frontend: https://tow-buddy-8nwu.vercel.app

🟢 Backend API: https://tow-buddy-1.onrender.com

📦 Repository: https://github.com/Daisyjosh/tow_buddy

🚀 Overview

TowBuddy is a real-time roadside assistance platform built using the MERN stack and Socket.io.

It enables:

Role-based authentication (Customer / Rider)

Real-time ride request broadcasting

OTP-based ride start verification

Dynamic fare estimation using distance

Live ride status updates

Rider availability toggle system

Full production deployment (Vercel + Render)

This project demonstrates real-time system design and production-ready full-stack architecture.
``` text
🏗 Architecture Overview
Frontend (React + Vite)
        │
        │ REST API (Axios)
        ▼
Backend (Node + Express)
        │
        │ Real-time Events (Socket.io)
        ▼
MongoDB Atlas (Cloud Database)

Socket rooms are used for ride-specific updates, ensuring scalable and isolated communication.
```

📁 Project Structure
```text
towbuddy/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── socket/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/
    │   ├── context/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    └── vite.config.js

```

``` text
⚙️ Local Setup
Backend
cd backend
npm install
npm run dev

Environment variables:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
Frontend
cd frontend
npm install
npm run dev

Environment variables:

VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

```

``` text
🚦 Ride Flow
Customer

Register / Login

Select pickup & drop location

View fare estimate

Request rescue

Share OTP with rider

Ride completes with real-time updates

Rider

Register as Rider

Go online

Accept ride request

Mark arrival

Verify OTP

Complete ride

All state transitions are synchronized using Socket.io.

🔄 Real-Time Events
Event	Description
new_ride	Broadcast new ride to online riders
ride_accepted	Notify customer of acceptance
rider_arrived	Notify customer arrival
ride_started	Ride officially begins
ride_completed	Ride finished
ride_cancelled	Ride cancelled
💰 Fare Calculation Logic
distance = haversine(pickup, dropoff)
base_fare = distance × ₹20
helper_charge = ₹100 if 2 rescuers required
total_fare = base_fare + helper_charge

Distance calculated using Haversine formula.

🧠 Technical Highlights

JWT authentication middleware

Role-based protected routes

Production CORS configuration

Axios interceptors with token injection

Socket room isolation per ride

Optimistic UI updates

MongoDB schema modeling

Cloud deployment (Render + Vercel)

Environment-based configuration

🌍 Deployment
Layer	Platform
Frontend	Vercel
Backend	Render
Database	MongoDB Atlas

Production CORS configured for secure cross-origin requests.

📌 Future Improvements

Live GPS tracking

Razorpay / Stripe integration

Rating system

Admin dashboard

Push notifications

Mobile app version

👩‍💻 Author

Daisy Panimaryial
Electrical & Electronics Engineering → Full Stack Developer

Open to internship opportunities in full-stack and real-time systems development.

🔥 This project reflects production-level system design, deployment, and real-time architecture implementation.
```


