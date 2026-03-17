const mongoose = require('mongoose');

const accessLinkSchema = new mongoose.Schema(
  {
    patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    records:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Record' }],
    token:         { type: String, required: true, unique: true },
    sharedWith: {
      email:    { type: String, required: true, lowercase: true },
      name:     { type: String },
      hospital: { type: String },
    },
    permission:    { type: String, enum: ['view', 'download'], default: 'view' },
    expiresAt:     { type: Date, required: true },
    isRevoked:     { type: Boolean, default: false },
    viewCount:     { type: Number, default: 0 },
    lastAccessedAt:{ type: Date },
    accessLog: [{
      accessedAt: { type: Date, default: Date.now },
      ipAddress:  String,
      userAgent:  String,
    }],
  },
  { timestamps: true }
);

accessLinkSchema.index({ token: 1 });
accessLinkSchema.index({ patient: 1 });
accessLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });  // TTL index

// Virtual: isExpired
accessLinkSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt;
});

// Virtual: isActive
accessLinkSchema.virtual('isActive').get(function () {
  return !this.isRevoked && new Date() < this.expiresAt;
});

accessLinkSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('AccessLink', accessLinkSchema);