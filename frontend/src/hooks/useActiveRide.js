import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { rideService } from '../services/rideService';
import toast from 'react-hot-toast';

export const useActiveRide = (rideId) => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket, joinRide, leaveRide } = useSocket();

  const fetchRide = useCallback(async () => {
    if (!rideId) { setLoading(false); return; }
    try {
      const { data } = await rideService.getRideById(rideId);
      setRide(data.ride);
    } catch {
      setRide(null);
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    fetchRide();
  }, [fetchRide]);

  useEffect(() => {
    if (!rideId || !socket) return;
    joinRide(rideId);

    const handleUpdate = (updatedRide) => setRide(updatedRide);

    socket.on('ride_accepted', handleUpdate);
    socket.on('rider_arrived', ({ otp }) => {
      setRide((prev) => prev ? { ...prev, status: 'arrived', otp: { code: otp, verified: false } } : prev);
      toast.success('Rider has arrived! Share the OTP to start the ride.');
    });
    socket.on('ride_started', handleUpdate);
    socket.on('ride_completed', handleUpdate);
    socket.on('ride_cancelled', handleUpdate);

    return () => {
      leaveRide(rideId);
      socket.off('ride_accepted');
      socket.off('rider_arrived');
      socket.off('ride_started');
      socket.off('ride_completed');
      socket.off('ride_cancelled');
    };
  }, [rideId, socket, joinRide, leaveRide]);

  return { ride, setRide, loading, refetch: fetchRide };
};
