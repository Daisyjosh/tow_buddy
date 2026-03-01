import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { rideService } from '../services/rideService';
import BookRide from '../components/BookRide';
import ActiveRideCard from '../components/ActiveRideCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDistance, SERVICE_LABELS } from '../utils/helpers';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { socket, joinRide } = useSocket();
  const [activeRide, setActiveRide] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('book'); // 'book' | 'history'

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRideAccepted = (ride) => {
      setActiveRide(ride);
      toast.success('A rider has accepted your request!');
    };
    const handleRiderArrived = ({ rideId, otp }) => {
      setActiveRide((prev) => prev ? { ...prev, status: 'arrived', otp: { code: otp, verified: false } } : prev);
      toast.success('Your rider has arrived! Share OTP: ' + otp, { duration: 8000 });
    };
    const handleRideStarted = (ride) => {
      setActiveRide(ride);
      toast('Ride started!');
    };
    const handleRideCompleted = (ride) => {
      setActiveRide(ride);
      toast.success('Ride completed! Thank you.');
    };
    const handleRideCancelled = (ride) => {
      setActiveRide(ride);
      toast.error('Ride was cancelled.');
    };

    socket.on('ride_accepted', handleRideAccepted);
    socket.on('rider_arrived', handleRiderArrived);
    socket.on('ride_started', handleRideStarted);
    socket.on('ride_completed', handleRideCompleted);
    socket.on('ride_cancelled', handleRideCancelled);

    return () => {
      socket.off('ride_accepted');
      socket.off('rider_arrived');
      socket.off('ride_started');
      socket.off('ride_completed');
      socket.off('ride_cancelled');
    };
  }, [socket]);

  useEffect(() => {
    if (activeRide && socket && ['pending', 'accepted', 'arrived', 'in_progress'].includes(activeRide.status)) {
      joinRide(activeRide._id);
    }
  }, [activeRide?._id, socket]);

  const fetchData = async () => {
    try {
      const [ridesRes] = await Promise.all([rideService.getMyRides()]);
      const rides = ridesRes.data.rides;
      setRideHistory(rides);

      const active = rides.find((r) =>
        ['pending', 'accepted', 'arrived', 'in_progress'].includes(r.status)
      );
      setActiveRide(active || null);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRideCreated = (ride) => {
    setActiveRide(ride);
    setView('active');
    if (socket) joinRide(ride._id);
  };

  const handleRideUpdate = (updatedRide) => {
    setActiveRide(updatedRide);
    if (updatedRide.status === 'completed' || updatedRide.status === 'cancelled') {
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  const hasActiveRide = activeRide && ['pending', 'accepted', 'arrived', 'in_progress'].includes(activeRide.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { key: hasActiveRide ? 'active' : 'book', label: hasActiveRide ? '🚨 Active Ride' : '📞 Book Ride' },
          { key: 'history', label: '📋 History' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
              view === tab.key ? 'bg-white shadow text-orange-700' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {hasActiveRide && (
          <button
            onClick={() => setView('book')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition ${
              view === 'book' ? 'bg-white shadow text-orange-700' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📞 Book
          </button>
        )}
      </div>

      {/* Active ride tab */}
      {view === 'active' && hasActiveRide && (
        <ActiveRideCard ride={activeRide} onRideUpdate={handleRideUpdate} />
      )}

      {/* Book ride tab */}
      {view === 'book' && (
        hasActiveRide ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-yellow-800 font-medium">You have an active ride.</p>
            <button onClick={() => setView('active')} className="text-orange-600 text-sm mt-1 underline">
              View active ride
            </button>
          </div>
        ) : (
          <BookRide onRideCreated={handleRideCreated} />
        )
      )}

      {/* History tab */}
      {view === 'history' && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Ride History</h3>
          {rideHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🏍</div>
              <p>No rides yet</p>
            </div>
          ) : (
            rideHistory.map((ride) => (
              <div key={ride._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{SERVICE_LABELS[ride.serviceType]}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatDistance(ride.distance)} • {formatCurrency(ride.fare.total)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(ride.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <StatusBadge status={ride.status} />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
