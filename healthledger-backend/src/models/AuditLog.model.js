const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actor:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actorRole:{ type: String, enum: ['patient','doctor'] },
    action:   {
      type: String,
      enum: ['register','login','logout','upload_record','delete_record','view_record',
             'download_record','create_link','revoke_link','access_link',
             'book_appointment','cancel_appointment','update_profile'],
      required: true,
    },
    resource:    String,
    resourceId:  { type: mongoose.Schema.Types.ObjectId },
    ipAddress:   String,
    userAgent:   String,
    details:     mongoose.Schema.Types.Mixed,
    success:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);