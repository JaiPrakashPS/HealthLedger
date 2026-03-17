const express = require('express');
const router  = express.Router();

const { createAppointment, getMyAppointments, getDoctorAppointments, cancelAppointment, completeAppointment } = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/',              protect, authorize('patient'), createAppointment);
router.get('/',               protect, authorize('patient'), getMyAppointments);
router.get('/doctor',         protect, authorize('doctor'),  getDoctorAppointments);
router.put('/:id/cancel',     protect, authorize('patient'), cancelAppointment);
router.put('/:id/complete',   protect, authorize('doctor'),  completeAppointment);

module.exports = router;