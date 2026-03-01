import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-6">🏍</div>
        <h1 className="text-5xl font-black text-gray-900 mb-4">
          Tow<span className="text-orange-600">Buddy</span>
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Two-wheeler roadside rescue — fast, reliable, affordable
        </p>
        <p className="text-gray-500 mb-12 max-w-xl mx-auto">
          Stuck on the road? Our trained rescuers are just a tap away. Battery jump, flat tyre,
          fuel delivery, towing — we've got you covered.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Link
              to={user.role === 'rider' ? '/rider' : '/customer'}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold px-8 py-4 rounded-xl text-lg transition"
              >
                Login
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20">
          {[
            { icon: '🔋', label: 'Battery Jump' },
            { icon: '🔧', label: 'Flat Tyre' },
            { icon: '⛽', label: 'Fuel Delivery' },
            { icon: '🚗', label: 'Towing' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="font-semibold text-gray-700 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
