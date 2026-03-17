const User           = require('../models/User.model');
const Notification   = require('../models/Notification.model');
const { generateToken } = require('../utils/jwt.utils');
const { logAction }  = require('../utils/auditLog.utils');

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, hospital, registrationNumber } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const userData = { name, email, password, role, phone };
    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.hospital = hospital;
      userData.registrationNumber = registrationNumber;
    }

    const user  = await User.create(userData);
    const token = generateToken(user._id);

    await Notification.create({
      user: user._id,
      type: 'upload_success',
      title: 'Welcome to HealthLedger!',
      message: `Your ${role} account has been created successfully.`,
    });

    await logAction({ actor: user._id, actorRole: role, action: 'register', resource: 'User', resourceId: user._id });

    res.status(201).json({ success: true, message: 'Account created successfully', data: { token, user } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is suspended' });
    }

    const token   = generateToken(user._id);
    const userObj = user.toJSON();

    await logAction({
      actor: user._id, actorRole: user.role, action: 'login',
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Login successful', data: { token, user: userObj } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, changePassword };