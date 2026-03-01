export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateFare = (distance, numberOfRiders) => {
  const RATE_PER_KM = 20;
  const HELPER_CHARGE = 100;
  const base = Math.round(distance * RATE_PER_KM);
  const helperCharge = numberOfRiders === 2 ? HELPER_CHARGE : 0;
  const total = base + helperCharge;
  return { base, helperCharge, total };
};

export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

export const formatCurrency = (amount) => `₹${amount}`;

export const STATUS_LABELS = {
  pending: 'Waiting for Rider',
  accepted: 'Rider on the Way',
  arrived: 'Rider Arrived',
  in_progress: 'Ride in Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  arrived: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const SERVICE_LABELS = {
  towing: '🚗 Towing',
  battery_jump: '🔋 Battery Jump',
  flat_tyre: '🔧 Flat Tyre',
  fuel_delivery: '⛽ Fuel Delivery',
  general: '🛠 General Help',
};
