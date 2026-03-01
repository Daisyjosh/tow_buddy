import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import RideMap from './RideMap';
import { rideService } from '../services/rideService';
import { formatCurrency, formatDistance, SERVICE_LABELS } from '../utils/helpers';
import toast from 'react-hot-toast';

const ActiveRideCard = ({ ride, onRideUpdate }) => {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    setCancelling(true);
    try {
      const { data } = await rideService.cancelRide(ride._id);
      toast.success('Ride cancelled');
      onRideUpdate(data.ride);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = ['pending', 'accepted'].includes(ride.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Active Ride</h2>
        <StatusBadge status={ride.status} />
      </div>

      <RideMap pickup={ride.pickup} dropoff={ride.dropoff} />

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Service</p>
          <p className="font-semibold mt-0.5">{SERVICE_LABELS[ride.serviceType]}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Distance</p>
          <p className="font-semibold mt-0.5">{formatDistance(ride.distance)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Fare</p>
          <p className="font-semibold mt-0.5 text-orange-600">{formatCurrency(ride.fare.total)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Rescuers</p>
          <p className="font-semibold mt-0.5">{ride.numberOfRiders}</p>
        </div>
      </div>

      {ride.status === 'arrived' && ride.otp?.code && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Share this OTP with the rider to start:</p>
          <div className="text-5xl font-bold tracking-widest text-orange-600">{ride.otp.code}</div>
        </div>
      )}

      {ride.status === 'pending' && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-yellow-50 rounded-lg p-3">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          Searching for nearby riders...
        </div>
      )}

      {ride.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-semibold text-green-700">Ride Completed!</p>
          <p className="text-sm text-gray-600 mt-1">
            Total paid: {formatCurrency(ride.fare.total)}
          </p>
        </div>
      )}

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl transition disabled:opacity-50"
        >
          {cancelling ? 'Cancelling...' : 'Cancel Ride'}
        </button>
      )}
    </div>
  );
};

export default ActiveRideCard;
