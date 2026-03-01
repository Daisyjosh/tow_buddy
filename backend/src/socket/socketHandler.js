const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initSocket = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Authentication error: User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} | User: ${socket.user._id} | Role: ${socket.user.role}`);

    // Riders join a common room to receive new ride notifications
    if (socket.user.role === 'rider') {
      socket.join('riders_room');
    }

    // Join a specific ride room for ride status updates
    socket.on('join_ride', (rideId) => {
      socket.join(`ride_${rideId}`);
      console.log(`${socket.user._id} joined ride room: ride_${rideId}`);
    });

    socket.on('leave_ride', (rideId) => {
      socket.leave(`ride_${rideId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
