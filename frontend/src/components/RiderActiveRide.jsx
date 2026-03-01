import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import RideMap from './RideMap';
import { rideService } from '../services/rideService';
import { formatCurrency, formatDistance, SERVICE_LABELS } from '../utils/helpers';
import toast from 'react-hot-toast';

const RiderActiveRide = ({ ride, onUpdate }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      let res;
      if (action === 'arrived') res = await rideService.markArrived(ride._id);
      else if (action === 'verify_otp') res = await rideService.verifyOtp(ride._id, otp);
      else if (action === 'complete') res = await rideService.completeRide(ride._id);
      else if (action === 'cancel') {
        if (!window.confirm('Cancel this ride?')) { setLoading(false); return; }
        res = await rideService.cancelRide(ride._id);
      }
      toast.success('Updated!');
      onUpdate(res.data.ride);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">Current Ride</h3>
        <StatusBadge status={ride.status} />
      </div>

      <RideMap pickup={ride.pickup} dropoff={ride.dropoff} height="220px" />

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Service</p>
          <p className="font-semibold">{SERVICE_LABELS[ride.serviceType]}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Distance</p>
          <p className="font-semibold">{formatDistance(ride.distance)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Earnings</p>
          <p className="font-semibold text-green-600">{formatCurrency(ride.fare.total)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 text-xs">Customer</p>
          <p className="font-semibold text-xs truncate">{ride.customer?.email || 'N/A'}</p>
        </div>
      </div>

      {/* Action buttons based on status */}
      {ride.status === 'accepted' && (
        <div className="space-y-2">
          <button
            onClick={() => handleAction('arrived')}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : '📍 Mark as Arrived'}
          </button>
          <button
            onClick={() => handleAction('cancel')}
            disabled={loading}
            className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl transition disabled:opacity-50"
          >
            Cancel Ride
          </button>
        </div>
      )}

      {ride.status === 'arrived' && (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-sm text-blue-700 font-medium">Ask customer for OTP to start the ride</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Enter 4-digit OTP"
              maxLength={4}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button
            onClick={() => handleAction('verify_otp')}
            disabled={loading || otp.length !== 4}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : '🔐 Verify OTP & Start'}
          </button>
        </div>
      )}

      {ride.status === 'in_progress' && (
        <button
          onClick={() => handleAction('complete')}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? 'Completing...' : '✅ Complete Ride'}
        </button>
      )}

      {ride.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-semibold text-green-700">Ride Completed!</p>
          <p className="text-sm text-gray-600">Earned {formatCurrency(ride.fare.total)}</p>
        </div>
      )}
    </div>
  );
};

export default RiderActiveRide;
