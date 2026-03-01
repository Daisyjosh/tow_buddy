const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    vehicleType: {
      type: String,
      enum: ['bike', 'scooter'],
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['towing', 'battery_jump', 'flat_tyre', 'fuel_delivery', 'general'],
      required: true,
    },
    numberOfRiders: {
      type: Number,
      enum: [1, 2],
      default: 1,
    },
    pickup: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    dropoff: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    distance: {
      type: Number,
      default: 0,
    },
    fare: {
      base: { type: Number, default: 0 },
      helperCharge: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    otp: {
      code: { type: String, default: null },
      verified: { type: Boolean, default: false },
    },
    timeline: {
      pending: { type: Date, default: null },
      accepted: { type: Date, default: null },
      arrived: { type: Date, default: null },
      in_progress: { type: Date, default: null },
      completed: { type: Date, default: null },
      cancelled: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ride', rideSchema);
