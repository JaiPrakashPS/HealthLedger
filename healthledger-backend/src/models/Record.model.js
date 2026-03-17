const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:   { type: String, required: [true, 'Record title is required'], trim: true },
    type: {
      type: String,
      enum: ['Lab Report', 'Radiology', 'Prescription', 'Cardiology', 'Vaccination', 'Certificate', 'Consultation', 'General'],
      required: true,
    },
    // Cloudinary fields
    fileUrl:     { type: String, required: true },
    filePublicId:{ type: String, required: true },
    fileType:    { type: String },   // mime type
    fileSize:    { type: Number },   // bytes
    fileName:    { type: String },   // original filename

    doctor:   { type: String, trim: true },
    hospital: { type: String, trim: true },
    notes:    { type: String },
    tags:     [{ type: String, lowercase: true, trim: true }],
    status:   { type: String, enum: ['normal', 'review', 'critical'], default: 'normal' },
    recordDate: { type: Date, default: Date.now },
    isDeleted:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for fast patient queries
recordSchema.index({ patient: 1, createdAt: -1 });
recordSchema.index({ patient: 1, type: 1 });

module.exports = mongoose.model('Record', recordSchema);