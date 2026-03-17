const express = require('express');
const router  = express.Router();

const { uploadRecord, getMyRecords, getRecord, updateRecord, deleteRecord, getTimeline } = require('../controllers/record.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadRecord: multerUpload } = require('../config/cloudinary');

router.post('/upload',  protect, authorize('patient'), multerUpload.single('file'), uploadRecord);
router.get('/timeline', protect, authorize('patient'), getTimeline);
router.get('/',         protect, authorize('patient'), getMyRecords);
router.get('/:id',      protect, authorize('patient'), getRecord);
router.put('/:id',      protect, authorize('patient'), updateRecord);
router.delete('/:id',   protect, authorize('patient'), deleteRecord);

module.exports = router;