const Appointment  = require('../models/Appointment.model');
const Notification = require('../models/Notification.model');
const { logAction } = require('../utils/auditLog.utils');

const createAppointment = async (req, res) => {
  try {
    const { doctorId, doctorName, specialization, hospital, date, time, type, reason, notes } = req.body;

    const appt = await Appointment.create({
      patient:        req.user.id,
      doctor:         doctorId || undefined,
      doctorName:     doctorName,
      specialization: specialization,
      hospital:       hospital,
      date:           new Date(date),
      time:           time,
      type:           type || 'In-person',
      reason:         reason,
      notes:          notes,
    });

    await Notification.create({
      user:    req.user.id,
      type:    'appointment_booked',
      title:   'Appointment Booked',
      message: `Appointment with ${doctorName || 'Doctor'} on ${date} at ${time} confirmed.`,
    });

    await logAction({
      actor: req.user.id, actorRole: req.user.role,
      action: 'book_appointment', resourceId: appt._id,
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: { appointment: appt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { patient: req.user.id };
    if (status && status !== 'all') filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name specialization hospital')
      .sort({ date: -1 });

    res.json({ success: true, data: { appointments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// FIX: query by doctor ObjectId OR by doctorName string (for manually booked appointments)
const getDoctorAppointments = async (req, res) => {
  try {
    const { status } = req.query;

    // Match appointments where doctor field = this doctor's ID
    // OR doctorName matches this doctor's name (case-insensitive)
    const filter = {
      $or: [
        { doctor: req.user.id },
        { doctorName: { $regex: req.user.name, $options: 'i' } },
      ],
    };
    if (status && status !== 'all') filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name phone bloodGroup dateOfBirth')
      .sort({ date: -1 });

    res.json({ success: true, data: { appointments } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    const appt = await Appointment.findOne({ _id: req.params.id, patient: req.user.id });
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appt.status       = 'cancelled';
    appt.cancelReason = reason;
    await appt.save();

    await Notification.create({
      user:    req.user.id,
      type:    'appointment_cancelled',
      title:   'Appointment Cancelled',
      message: `Appointment on ${appt.date.toDateString()} has been cancelled.`,
    });

    res.json({ success: true, message: 'Appointment cancelled', data: { appointment: appt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const completeAppointment = async (req, res) => {
  try {
    const { completedNotes } = req.body;

    // Allow completion if doctor field matches OR doctorName matches
    const appt = await Appointment.findOne({
      _id: req.params.id,
      $or: [
        { doctor: req.user.id },
        { doctorName: { $regex: req.user.name, $options: 'i' } },
      ],
    });

    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appt.status         = 'completed';
    appt.completedNotes = completedNotes;
    await appt.save();

    res.json({ success: true, message: 'Appointment completed', data: { appointment: appt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createAppointment, getMyAppointments, getDoctorAppointments, cancelAppointment, completeAppointment };