const express = require('express');
const router  = express.Router();

const { getProfile, updateProfile, getDoctors } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/doctors', protect, getDoctors);

module.exports = router;