const AccessLink  = require('../models/AccessLink.model');
const Appointment = require('../models/Appointment.model');

// GET /api/doctors/patients
// Shows ALL patients ever treated (from appointments) + their link status
const getMyPatients = async (req, res) => {
  try {
    // 1. Get all appointments for this doctor (by ID or name)
    const appointments = await Appointment.find({
      $or: [
        { doctor: req.user.id },
        { doctorName: { $regex: req.user.name, $options: 'i' } },
      ],
    })
      .populate('patient', 'name phone bloodGroup dateOfBirth gender chronicConditions')
      .sort({ date: -1 });

    // 2. Get all access links shared with this doctor
    const links = await AccessLink.find({
      'sharedWith.email': req.user.email,
    })
      .populate('records', 'title type recordDate status')
      .sort({ createdAt: -1 });

    // 3. Build a map of patientId → active link (if any)
    const activeLinkMap = new Map();
    links.forEach(link => {
      const pid = link.patient?.toString();
      if (!pid) return;
      const isActive = !link.isRevoked && new Date(link.expiresAt) > new Date();
      // Keep the most recent active link per patient
      if (isActive && !activeLinkMap.has(pid)) {
        activeLinkMap.set(pid, link);
      }
    });

    // 4. Build a map of patientId → revoked/expired link (for history)
    const revokedLinkMap = new Map();
    links.forEach(link => {
      const pid = link.patient?.toString();
      if (!pid) return;
      const isRevoked = link.isRevoked || new Date(link.expiresAt) <= new Date();
      if (isRevoked && !activeLinkMap.has(pid) && !revokedLinkMap.has(pid)) {
        revokedLinkMap.set(pid, link);
      }
    });

    // 5. Deduplicate patients from appointments
    const patientsMap = new Map();
    appointments.forEach(appt => {
      if (!appt.patient) return;
      const pid = appt.patient._id.toString();

      if (!patientsMap.has(pid)) {
        const activeLink  = activeLinkMap.get(pid)  || null;
        const revokedLink = revokedLinkMap.get(pid) || null;

        patientsMap.set(pid, {
          patient:       appt.patient,
          appointments:  [],
          // If active link exists → can view records
          hasActiveLink: !!activeLink,
          activeLink,
          // If only revoked/expired link → treated but no record access
          hasRevokedLink: !activeLink && !!revokedLink,
          revokedLink,
          // Records available only if link is active
          records: activeLink ? activeLink.records : [],
          permission: activeLink ? activeLink.permission : null,
          linkExpiresAt: activeLink ? activeLink.expiresAt : null,
        });
      }

      // Add appointment to this patient's list
      patientsMap.get(pid).appointments.push({
        _id:      appt._id,
        date:     appt.date,
        time:     appt.time,
        type:     appt.type,
        reason:   appt.reason,
        status:   appt.status,
        completedNotes: appt.completedNotes,
      });
    });

    res.json({ success: true, data: { patients: Array.from(patientsMap.values()) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/doctors/shared-records
// Only returns records from ACTIVE (non-revoked, non-expired) links
const getSharedRecords = async (req, res) => {
  try {
    const links = await AccessLink.find({
      'sharedWith.email': req.user.email,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .populate('records', 'title type fileUrl fileType fileSize recordDate doctor hospital status notes')
      .populate('patient', 'name bloodGroup dateOfBirth')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { links } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyPatients, getSharedRecords };