const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // If doctor not yet registered:
    doctorName:     { type: String, trim: true },
    specialization: { type: String, trim: true },
    hospital:       { type: String, trim: true },

    date:  { type: Date, required: true },
    time:  { type: String, required: true },
    type:  { type: String, enum: ['In-person', 'Video'], default: 'In-person' },
    reason:{ type: String, trim: true },
    notes: { type: String },

    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled', 'rescheduled'],
      default: 'upcoming',
    },
    cancelReason:   String,
    completedNotes: String,
  },
  { timestamps: true }
);

appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);