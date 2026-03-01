import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-orange-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">🏍</span>
          <span>TowBuddy</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-sm">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-300' : 'bg-red-300'}`} />
              {connected ? 'Live' : 'Offline'}
            </span>
            <span className="text-sm hidden sm:block">
              {user.email} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-orange-700 hover:bg-orange-800 px-3 py-1.5 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
