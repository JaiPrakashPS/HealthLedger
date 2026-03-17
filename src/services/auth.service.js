import API from './api';

export const authService = {
  // Register patient or doctor
  register: async (data) => {
    const res = await API.post('/auth/register', data);
    return res.data;
  },

  // Login — returns token + user
  login: async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('hv_token', res.data.data.token);
      localStorage.setItem('hv_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  // Get current logged-in user from API
  getMe: async () => {
    const res = await API.get('/auth/me');
    return res.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const res = await API.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },

  // Logout — clear local storage
  logout: () => {
    localStorage.removeItem('hv_token');
    localStorage.removeItem('hv_user');
  },

  // Get saved user from localStorage (no API call)
  getSavedUser: () => {
    try {
      const user = localStorage.getItem('hv_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // Check if token exists
  isLoggedIn: () => !!localStorage.getItem('hv_token'),
};