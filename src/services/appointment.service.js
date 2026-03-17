import API from './api';

export const appointmentService = {
  // Book appointment (patient)
  create: async (data) => {
    const res = await API.post('/appointments', data);
    return res.data;
  },

  // Get patient's appointments
  getAll: async (params = {}) => {
    const res = await API.get('/appointments', { params });
    return res.data;
  },

  // Get doctor's appointments
  getDoctorAppointments: async (params = {}) => {
    const res = await API.get('/appointments/doctor', { params });
    return res.data;
  },

  // Cancel appointment (patient)
  cancel: async (id, reason) => {
    const res = await API.put(`/appointments/${id}/cancel`, { reason });
    return res.data;
  },

  // Complete appointment (doctor)
  complete: async (id, completedNotes) => {
    const res = await API.put(`/appointments/${id}/complete`, { completedNotes });
    return res.data;
  },
};