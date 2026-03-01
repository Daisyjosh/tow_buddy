const RATE_PER_KM = 20;
const HELPER_CHARGE = 100;

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateFare = (distance, numberOfRiders) => {
  const base = Math.round(distance * RATE_PER_KM);
  const helperCharge = numberOfRiders === 2 ? HELPER_CHARGE : 0;
  const total = base + helperCharge;
  return { base, helperCharge, total };
};

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = { haversineDistance, calculateFare, generateOTP };
