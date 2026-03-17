import API from './api';

export const doctorService = {
  // Get all patients who shared records with this doctor
  getPatients: async () => {
    const res = await API.get('/doctors/patients');
    return res.data;
  },

  // Get all shared record links
  getSharedRecords: async () => {
    const res = await API.get('/doctors/shared-records');
    return res.data;
  },
};