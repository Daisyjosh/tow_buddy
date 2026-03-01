const Ride = require('../models/Ride');
const RiderProfile = require('../models/RiderProfile');
const { haversineDistance, calculateFare, generateOTP } = require('../utils/fareUtils');

// Customer: Create a new ride
const createRide = async (req, res, next) => {
  try {
    const { vehicleType, serviceType, numberOfRiders, pickup, dropoff } = req.body;

    if (!pickup || !dropoff || !vehicleType || !serviceType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Prevent multiple active rides
    const activeRide = await Ride.findOne({
      customer: req.user._id,
      status: { $in: ['pending', 'accepted', 'arrived', 'in_progress'] },
    });

    if (activeRide) {
      return res.status(400).json({ success: false, message: 'You already have an active ride' });
    }

    const distance = haversineDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const fare = calculateFare(distance, numberOfRiders || 1);

    const ride = await Ride.create({
      customer: req.user._id,
      vehicleType,
      serviceType,
      numberOfRiders: numberOfRiders || 1,
      pickup,
      dropoff,
      distance: parseFloat(distance.toFixed(2)),
      fare,
      status: 'pending',
      'timeline.pending': new Date(),
    });

    // Emit to all riders via socket
    const io = req.app.get('io');
    if (io) {
      io.to('riders_room').emit('new_ride', ride);
    }

    res.status(201).json({ success: true, ride });
  } catch (error) {
    next(error);
  }
};

// Rider: Get all pending rides
const getPendingRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({ status: 'pending' })
      .populate('customer', 'email')
      .sort({ createdAt: -1 });
    res.json({ success: true, rides });
  } catch (error) {
    next(error);
  }
};

// Rider: Accept a ride (atomic to prevent race conditions)
const acceptRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;

    // Check rider profile availability
    const riderProfile = await RiderProfile.findOne({ user: req.user._id });
    if (!riderProfile) {
      return res.status(404).json({ success: false, message: 'Rider profile not found' });
    }
    if (!riderProfile.isOnline) {
      return res.status(400).json({ success: false, message: 'You must be online to accept rides' });
    }
    if (!riderProfile.isAvailable) {
      return res.status(400).json({ success: false, message: 'You are already on a ride' });
    }

    // Atomic update to prevent race condition
    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, status: 'pending', rider: null },
      {
        rider: req.user._id,
        status: 'accepted',
        'timeline.accepted': new Date(),
      },
      { new: true }
    ).populate('customer', 'email');

    if (!ride) {
      return res.status(409).json({ success: false, message: 'Ride is no longer available' });
    }

    // Update rider profile
    await RiderProfile.findOneAndUpdate(
      { user: req.user._id },
      { isAvailable: false, currentRide: ride._id }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`ride_${rideId}`).emit('ride_accepted', ride);
      io.to('riders_room').emit('ride_taken', { rideId });
    }

    res.json({ success: true, ride });
  } catch (error) {
    next(error);
  }
};

// Rider: Mark arrived at pickup
const markArrived = async (req, res, next) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findOne({ _id: rideId, rider: req.user._id, status: 'accepted' });
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found or invalid status' });
    }

    const otpCode = generateOTP();
    ride.status = 'arrived';
    ride.otp.code = otpCode;
    ride.otp.verified = false;
    ride.timeline.arrived = new Date();
    await ride.save();

    const io = req.app.get('io');
    if (io) {
      // Send OTP to customer room only
      io.to(`ride_${rideId}`).emit('rider_arrived', { rideId, otp: otpCode });
    }

    res.json({ success: true, ride, otp: otpCode });
  } catch (error) {
    next(error);
  }
};

// Rider: Verify OTP and start ride
const verifyOtp = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { otp } = req.body;

    const ride = await Ride.findOne({ _id: rideId, rider: req.user._id, status: 'arrived' });
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found or invalid status' });
    }

    if (ride.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    ride.status = 'in_progress';
    ride.otp.verified = true;
    ride.timeline.in_progress = new Date();
    await ride.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`ride_${rideId}`).emit('ride_started', ride);
    }

    res.json({ success: true, ride });
  } catch (error) {
    next(error);
  }
};

// Rider: Complete ride
const completeRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findOne({ _id: rideId, rider: req.user._id, status: 'in_progress' });
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found or invalid status' });
    }

    ride.status = 'completed';
    ride.timeline.completed = new Date();
    await ride.save();

    // Update rider earnings and availability
    await RiderProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        isAvailable: true,
        currentRide: null,
        $inc: {
          'earnings.today': ride.fare.total,
          'earnings.total': ride.fare.total,
        },
      }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`ride_${rideId}`).emit('ride_completed', ride);
    }

    res.json({ success: true, ride });
  } catch (error) {
    next(error);
  }
};

// Cancel ride
const cancelRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;

    const query =
      req.user.role === 'customer'
        ? { _id: rideId, customer: req.user._id, status: { $in: ['pending', 'accepted'] } }
        : { _id: rideId, rider: req.user._id, status: { $in: ['accepted', 'arrived'] } };

    const ride = await Ride.findOne(query);
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found or cannot be cancelled' });
    }

    ride.status = 'cancelled';
    ride.timeline.cancelled = new Date();
    await ride.save();

    // Reset rider if assigned
    if (ride.rider) {
      await RiderProfile.findOneAndUpdate(
        { user: ride.rider },
        { isAvailable: true, currentRide: null }
      );
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`ride_${rideId}`).emit('ride_cancelled', ride);
      io.to('riders_room').emit('ride_cancelled_pending', { rideId });
    }

    res.json({ success: true, ride });
  } catch (error) {
    next(error);
  }
};

// Get ride by ID
const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('customer', 'email')
      .populate('rider', 'email');
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
    res.json({ success: true, ride });
  } catch (error) {
    next(error);
  }
};

// Get customer's ride history
const getMyRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, rides });
  } catch (error) {
    next(error);
  }
};

// Get rider's active ride
const getRiderActiveRide = async (req, res, next) => {
  try {
    const ride = await Ride.findOne({
      rider: req.user._id,
      status: { $in: ['accepted', 'arrived', 'in_progress'] },
    }).populate('customer', 'email');
    res.json({ success: true, ride: ride || null });
  } catch (error) {
    next(error);
  }
};

// Estimate fare before booking
const estimateFare = async (req, res, next) => {
  try {
    const { pickup, dropoff, numberOfRiders } = req.body;
    if (!pickup || !dropoff) {
      return res.status(400).json({ success: false, message: 'Pickup and dropoff required' });
    }
    const distance = haversineDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const fare = calculateFare(distance, numberOfRiders || 1);
    res.json({ success: true, distance: parseFloat(distance.toFixed(2)), fare });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRide,
  getPendingRides,
  acceptRide,
  markArrived,
  verifyOtp,
  completeRide,
  cancelRide,
  getRideById,
  getMyRides,
  getRiderActiveRide,
  estimateFare,
};
