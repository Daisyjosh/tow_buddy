import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('towbuddy_token');
      const socket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));

      socketRef.current = socket;

      return () => {
        socket.disconnect();
        socketRef.current = null;
        setConnected(false);
      };
    }
  }, [user]);

  const joinRide = (rideId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_ride', rideId);
    }
  };

  const leaveRide = (rideId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_ride', rideId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinRide, leaveRide }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
