import API from './api';

export const recordService = {
  // Upload a medical record (multipart/form-data)
  upload: async (formData) => {
    const res = await API.post('/records/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Get all records with optional filters
  getAll: async (params = {}) => {
    const res = await API.get('/records', { params });
    return res.data;
  },

  // Get timeline (all records sorted by date)
  getTimeline: async () => {
    const res = await API.get('/records/timeline');
    return res.data;
  },

  // Get single record
  getById: async (id) => {
    const res = await API.get(`/records/${id}`);
    return res.data;
  },

  // Update record metadata
  update: async (id, data) => {
    const res = await API.put(`/records/${id}`, data);
    return res.data;
  },

  // Delete record
  delete: async (id) => {
    const res = await API.delete(`/records/${id}`);
    return res.data;
  },
};