import React, { useState } from 'react';
import { rideService } from '../services/rideService';
import { formatCurrency, formatDistance, SERVICE_LABELS } from '../utils/helpers';
import toast from 'react-hot-toast';

const PendingRideCard = ({ ride, onAccepted }) => {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const { data } = await rideService.acceptRide(ride._id);
      toast.success('Ride accepted!');
      onAccepted(data.ride);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept ride');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-800">{SERVICE_LABELS[ride.serviceType]}</p>
          <p className="text-sm text-gray-500">
            {ride.vehicleType} • {ride.numberOfRiders} rescuer{ride.numberOfRiders > 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-orange-600 text-lg">{formatCurrency(ride.fare.total)}</p>
          <p className="text-xs text-gray-400">{formatDistance(ride.distance)}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-green-600 font-medium">📍 Pickup</span>
          <p>{ride.pickup.lat.toFixed(4)}, {ride.pickup.lng.toFixed(4)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <span className="text-red-600 font-medium">🏁 Dropoff</span>
          <p>{ride.dropoff.lat.toFixed(4)}, {ride.dropoff.lng.toFixed(4)}</p>
        </div>
      </div>
      <button
        onClick={handleAccept}
        disabled={accepting}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
      >
        {accepting ? 'Accepting...' : '✅ Accept Ride'}
      </button>
    </div>
  );
};

export default PendingRideCard;
