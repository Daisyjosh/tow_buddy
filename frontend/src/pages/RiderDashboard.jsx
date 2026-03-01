import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { riderService } from '../services/riderService';
import { rideService } from '../services/rideService';
import PendingRideCard from '../components/PendingRideCard';
import RiderActiveRide from '../components/RiderActiveRide';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const RiderDashboard = () => {
  const { user, profile: initialProfile, updateProfile } = useAuth();
  const { socket, joinRide } = useSocket();
  const [profile, setProfile] = useState(initialProfile);
  const [pendingRides, setPendingRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, activeRes] = await Promise.all([
        riderService.getProfile(),
        rideService.getRiderActiveRide(),
      ]);
      const newProfile = profileRes.data.profile;
      setProfile(newProfile);
      updateProfile(newProfile);
      setActiveRide(activeRes.data.ride);

      if (newProfile.isOnline && newProfile.isAvailable && !activeRes.data.ride) {
        const pendingRes = await rideService.getPendingRides();
        setPendingRides(pendingRes.data.rides);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!socket) return;

    const handleNewRide = (ride) => {
      setPendingRides((prev) => {
        if (prev.find((r) => r._id === ride._id)) return prev;
        return [ride, ...prev];
      });
      toast('New ride request nearby!', { icon: '🚨' });
    };

    const handleRideTaken = ({ rideId }) => {
      setPendingRides((prev) => prev.filter((r) => r._id !== rideId));
    };

    const handleRideCancelled = ({ rideId }) => {
      setPendingRides((prev) => prev.filter((r) => r._id !== rideId));
    };

    socket.on('new_ride', handleNewRide);
    socket.on('ride_taken', handleRideTaken);
    socket.on('ride_cancelled_pending', handleRideCancelled);

    return () => {
      socket.off('new_ride');
      socket.off('ride_taken');
      socket.off('ride_cancelled_pending');
    };
  }, [socket]);

  useEffect(() => {
    if (activeRide && socket) {
      joinRide(activeRide._id);
    }
  }, [activeRide?._id, socket]);

  const handleToggleOnline = async () => {
    setTogglingOnline(true);
    try {
      const { data } = await riderService.toggleOnline();
      setProfile(data.profile);
      updateProfile(data.profile);
      toast.success(data.profile.isOnline ? 'You are now online!' : 'You are now offline');
      if (data.profile.isOnline) {
        const pendingRes = await rideService.getPendingRides();
        setPendingRides(pendingRes.data.rides);
      } else {
        setPendingRides([]);
      }
    } catch {
      toast.error('Failed to toggle status');
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleRideAccepted = (ride) => {
    setActiveRide(ride);
    setPendingRides([]);
    if (socket) joinRide(ride._id);
  };

  const handleRideUpdate = (updatedRide) => {
    setActiveRide(updatedRide);
    if (['completed', 'cancelled'].includes(updatedRide.status)) {
      setTimeout(() => {
        setActiveRide(null);
        fetchData();
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  const hasActiveRide =
    activeRide && ['accepted', 'arrived', 'in_progress'].includes(activeRide.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rider Dashboard</h1>
          <p className="text-gray-500 text-sm">{profile?.name || user?.email}</p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
            profile?.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {profile?.isOnline ? '🟢 Online' : '⚫ Offline'}
        </div>
      </div>

      {/* Earnings summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Today's Earnings</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(profile?.earnings?.today || 0)}
          </p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Total Earnings</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(profile?.earnings?.total || 0)}
          </p>
        </div>
      </div>

      {/* Toggle Online button */}
      {!hasActiveRide && (
        <button
          onClick={handleToggleOnline}
          disabled={togglingOnline}
          className={`w-full font-bold py-4 rounded-xl text-lg transition disabled:opacity-50 ${
            profile?.isOnline
              ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
        >
          {togglingOnline
            ? 'Updating...'
            : profile?.isOnline
            ? '⚫ Go Offline'
            : '🟢 Go Online & Accept Rides'}
        </button>
      )}

      {/* Active ride */}
      {hasActiveRide && (
        <RiderActiveRide ride={activeRide} onUpdate={handleRideUpdate} />
      )}

      {/* Completed/cancelled ride info */}
      {activeRide && ['completed', 'cancelled'].includes(activeRide.status) && (
        <RiderActiveRide ride={activeRide} onUpdate={handleRideUpdate} />
      )}

      {/* Pending rides */}
      {profile?.isOnline && !hasActiveRide && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Pending Rides</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {pendingRides.length}
            </span>
          </div>

          {pendingRides.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-3 animate-bounce">🔍</div>
              <p className="text-sm">No pending rides nearby</p>
              <p className="text-xs mt-1">New requests will appear here in real-time</p>
            </div>
          ) : (
            pendingRides.map((ride) => (
              <PendingRideCard
                key={ride._id}
                ride={ride}
                onAccepted={handleRideAccepted}
              />
            ))
          )}
        </div>
      )}

      {!profile?.isOnline && !hasActiveRide && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">💤</div>
          <p>Go online to start accepting rides</p>
        </div>
      )}
    </div>
  );
};

export default RiderDashboard;
