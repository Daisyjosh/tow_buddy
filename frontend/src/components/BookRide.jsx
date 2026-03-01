import React, { useState, useEffect } from 'react';
import MapPicker from './MapPicker';
import { rideService } from '../services/rideService';
import { formatCurrency, formatDistance, SERVICE_LABELS } from '../utils/helpers';
import toast from 'react-hot-toast';

const SERVICE_TYPES = ['towing', 'battery_jump', 'flat_tyre', 'fuel_delivery', 'general'];
const VEHICLE_TYPES = ['bike', 'scooter'];

const BookRide = ({ onRideCreated }) => {
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [vehicleType, setVehicleType] = useState('bike');
  const [serviceType, setServiceType] = useState('towing');
  const [numberOfRiders, setNumberOfRiders] = useState(1);
  const [estimate, setEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (pickup && dropoff) {
      fetchEstimate();
    }
  }, [pickup, dropoff, numberOfRiders]);

  const fetchEstimate = async () => {
    setEstimating(true);
    try {
      const { data } = await rideService.estimateFare({ pickup, dropoff, numberOfRiders });
      setEstimate(data);
    } catch {
      toast.error('Failed to estimate fare');
    } finally {
      setEstimating(false);
    }
  };

  const handleBook = async () => {
    if (!pickup || !dropoff) {
      toast.error('Please select pickup and dropoff locations');
      return;
    }
    setBooking(true);
    try {
      const { data } = await rideService.createRide({
        pickup,
        dropoff,
        vehicleType,
        serviceType,
        numberOfRiders,
      });
      toast.success('Ride booked! Looking for riders...');
      onRideCreated(data.ride);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book ride');
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
      <h2 className="text-xl font-bold text-gray-800">Book a Rescue</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
        <div className="flex gap-3">
          {VEHICLE_TYPES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVehicleType(v)}
              className={`flex-1 py-2 rounded-lg border-2 font-medium capitalize transition text-sm ${
                vehicleType === v
                  ? 'border-orange-600 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {v === 'bike' ? '🏍 Bike' : '🛵 Scooter'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICE_TYPES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setServiceType(s)}
              className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition ${
                serviceType === s
                  ? 'border-orange-600 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {SERVICE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rescuers</label>
        <div className="flex gap-3">
          {[1, 2].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNumberOfRiders(n)}
              className={`flex-1 py-2 rounded-lg border-2 font-medium transition text-sm ${
                numberOfRiders === n
                  ? 'border-orange-600 bg-orange-50 text-orange-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {n === 1 ? '1 Rider' : '2 Riders (+₹100)'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Locations</label>
        <MapPicker
          pickup={pickup}
          dropoff={dropoff}
          onPickupChange={setPickup}
          onDropoffChange={setDropoff}
        />
      </div>

      {estimating && (
        <div className="text-center text-sm text-gray-500 animate-pulse">Calculating fare...</div>
      )}

      {estimate && !estimating && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <h3 className="font-semibold text-gray-800 mb-3">Fare Estimate</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Distance</span>
              <span className="font-medium">{formatDistance(estimate.distance)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Base fare ({estimate.distance.toFixed(1)} km × ₹20)</span>
              <span className="font-medium">{formatCurrency(estimate.fare.base)}</span>
            </div>
            {estimate.fare.helperCharge > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Helper charge</span>
                <span className="font-medium">{formatCurrency(estimate.fare.helperCharge)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-900 font-bold text-base pt-2 border-t border-orange-200 mt-2">
              <span>Total</span>
              <span>{formatCurrency(estimate.fare.total)}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleBook}
        disabled={booking || !pickup || !dropoff}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {booking ? 'Booking...' : '🆘 Request Rescue'}
      </button>
    </div>
  );
};

export default BookRide;
