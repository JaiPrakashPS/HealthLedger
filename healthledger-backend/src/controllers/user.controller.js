const User = require('../models/User.model');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name','phone','dateOfBirth','gender','bloodGroup','height','weight',
      'address','allergies','chronicConditions','currentMedications',
      'emergencyContact','insurance',
      'specialization','hospital','experience','degrees','clinicAddress',
    ];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated successfully', data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const { search, specialization } = req.query;
    const filter = { role: 'doctor', isActive: true };

    if (search) {
      filter.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } },
      ];
    }
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    // Include email so the share link can be sent to the doctor
    const doctors = await User.find(filter)
      .select('name email specialization hospital experience degrees clinicAddress');

    res.json({ success: true, data: { doctors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile, getDoctors };