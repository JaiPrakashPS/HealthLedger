const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:    {
      type: String,
      enum: ['upload_success','access_granted','link_expired','link_revoked',
             'appointment_booked','appointment_reminder','appointment_cancelled','record_shared'],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    link:    String,
    meta:    mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);