import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icons for webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const ClickHandler = ({ onPickup, onDropoff, mode }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (mode === 'pickup') onPickup({ lat, lng });
      else onDropoff({ lat, lng });
    },
  });
  return null;
};

const MapPicker = ({ pickup, dropoff, onPickupChange, onDropoffChange }) => {
  const [mode, setMode] = useState('pickup');
  const defaultCenter = [20.5937, 78.9629]; // India center

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('pickup')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'pickup'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📍 Set Pickup {pickup && `(${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)})`}
        </button>
        <button
          type="button"
          onClick={() => setMode('dropoff')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            mode === 'dropoff'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🏁 Set Dropoff {dropoff && `(${dropoff.lat.toFixed(4)}, ${dropoff.lng.toFixed(4)})`}
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Click on map to set {mode === 'pickup' ? 'pickup' : 'dropoff'} location
      </p>
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '300px' }}>
        <MapContainer
          center={pickup ? [pickup.lat, pickup.lng] : defaultCenter}
          zoom={pickup ? 13 : 5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ClickHandler onPickup={onPickupChange} onDropoff={onDropoffChange} mode={mode} />
          {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
          {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPicker;
