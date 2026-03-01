import api from './api';

export const riderService = {
  getProfile: () => api.get('/rider/profile'),
  updateProfile: (data) => api.put('/rider/profile', data),
  toggleOnline: () => api.patch('/rider/toggle-online'),
};
