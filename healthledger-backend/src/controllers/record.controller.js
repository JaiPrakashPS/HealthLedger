const Record       = require('../models/Record.model');
const Notification = require('../models/Notification.model');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinary');
const { logAction } = require('../utils/auditLog.utils');

// POST /api/records/upload
const uploadRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, type, doctor, hospital, notes, tags, status, recordDate } = req.body;

    if (!title || !type) {
      return res.status(400).json({ success: false, message: 'Title and type are required' });
    }

    const isImage = req.file.mimetype.startsWith('image/');

    // Upload buffer → Cloudinary
    const cloudResult = await uploadToCloudinary(req.file.buffer, {
      folder:        `healthledger/records/${req.user.id}`,
      resource_type: isImage ? 'image' : 'raw',
      public_id:     `record_${Date.now()}_${req.file.originalname.replace(/\s/g, '_')}`,
    });

    const record = await Record.create({
      patient:      req.user.id,
      title,
      type,
      doctor:       doctor || '',
      hospital:     hospital || '',
      notes:        notes || '',
      tags:         tags ? tags.split(',').map(t => t.trim()) : [],
      status:       status || 'normal',
      recordDate:   recordDate ? new Date(recordDate) : new Date(),
      fileUrl:      cloudResult.secure_url,
      filePublicId: cloudResult.public_id,
      fileType:     req.file.mimetype,
      fileSize:     req.file.size,
      fileName:     req.file.originalname,
    });

    await Notification.create({
      user:    req.user.id,
      type:    'upload_success',
      title:   'Record Uploaded',
      message: `${title} uploaded successfully.`,
    });

    await logAction({
      actor: req.user.id, actorRole: req.user.role,
      action: 'upload_record', resource: 'Record', resourceId: record._id,
      details: { title, type },
    });

    res.status(201).json({ success: true, message: 'Record uploaded successfully', data: { record } });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/records
const getMyRecords = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    const filter = { patient: req.user.id, isDeleted: false };

    if (type && type !== 'All') filter.type = type;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip  = (page - 1) * limit;
    const total = await Record.countDocuments(filter);
    const records = await Record.find(filter)
      .sort({ recordDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        records,
        pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/records/timeline
const getTimeline = async (req, res) => {
  try {
    const records = await Record.find({ patient: req.user.id, isDeleted: false })
      .sort({ recordDate: -1 });
    res.json({ success: true, data: { records } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/records/:id
const getRecord = async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, patient: req.user.id, isDeleted: false });
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    await logAction({
      actor: req.user.id, actorRole: req.user.role,
      action: 'view_record', resource: 'Record', resourceId: record._id,
    });
    res.json({ success: true, data: { record } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/records/:id
const updateRecord = async (req, res) => {
  try {
    const { title, type, doctor, hospital, notes, tags, status } = req.body;
    const updateData = { title, type, doctor, hospital, notes, status };
    if (tags) updateData.tags = tags.split(',').map(t => t.trim());

    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, patient: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record updated', data: { record } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/records/:id
const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, patient: req.user.id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(record.filePublicId, {
        resource_type: record.fileType && record.fileType.startsWith('image/') ? 'image' : 'raw',
      });
    } catch (cloudErr) {
      console.warn('Cloudinary delete failed (non-fatal):', cloudErr.message);
    }

    record.isDeleted = true;
    await record.save();

    await logAction({
      actor: req.user.id, actorRole: req.user.role,
      action: 'delete_record', resource: 'Record', resourceId: record._id,
    });

    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadRecord, getMyRecords, getRecord, updateRecord, deleteRecord, getTimeline };