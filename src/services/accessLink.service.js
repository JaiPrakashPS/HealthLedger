import API from './api';

export const accessLinkService = {
  // Create a new share link
  create: async ({ recordIds, sharedWith, permission, expiryDays }) => {
    const res = await API.post('/access-links', { recordIds, sharedWith, permission, expiryDays });
    return res.data;
  },

  // Get all my active links
  getAll: async () => {
    const res = await API.get('/access-links');
    return res.data;
  },

  // Access records via public token (no auth needed)
  accessByToken: async (token) => {
    const res = await API.get(`/access-links/shared/${token}`);
    return res.data;
  },

  // Revoke a link
  revoke: async (id) => {
    const res = await API.put(`/access-links/${id}/revoke`);
    return res.data;
  },

  // Delete a link
  delete: async (id) => {
    const res = await API.delete(`/access-links/${id}`);
    return res.data;
  },
};