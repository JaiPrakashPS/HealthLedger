const express = require('express');
const router  = express.Router();

const { getMyPatients, getSharedRecords } = require('../controllers/doctor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/patients',       protect, authorize('doctor'), getMyPatients);
router.get('/shared-records', protect, authorize('doctor'), getSharedRecords);

module.exports = router;