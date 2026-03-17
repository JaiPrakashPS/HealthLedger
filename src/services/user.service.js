import API from './api';

export const userService = {
  // Get own profile
  getProfile: async () => {
    const res = await API.get('/users/profile');
    return res.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const res = await API.put('/users/profile', data);
    return res.data;
  },

  // Search doctors
  getDoctors: async (params = {}) => {
    const res = await API.get('/users/doctors', { params });
    return res.data;
  },
};