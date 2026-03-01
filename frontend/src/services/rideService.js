import api from './api';

export const rideService = {
  createRide: (data) => api.post('/rides', data),
  estimateFare: (data) => api.post('/rides/estimate', data),
  getMyRides: () => api.get('/rides/my'),
  getPendingRides: () => api.get('/rides/pending'),
  getRiderActiveRide: () => api.get('/rides/active'),
  getRideById: (id) => api.get(`/rides/${id}`),
  acceptRide: (id) => api.patch(`/rides/${id}/accept`),
  markArrived: (id) => api.patch(`/rides/${id}/arrived`),
  verifyOtp: (id, otp) => api.patch(`/rides/${id}/verify-otp`, { otp }),
  completeRide: (id) => api.patch(`/rides/${id}/complete`),
  cancelRide: (id) => api.patch(`/rides/${id}/cancel`),
};
