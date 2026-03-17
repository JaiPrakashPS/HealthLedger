const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    phone: { type: String, trim: true },
    role:  { type: String, enum: ['patient', 'doctor'], required: true },
    isActive: { type: Boolean, default: true },

    // Patient fields
    dateOfBirth: Date,
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
    height: Number,
    weight: Number,
    address: String,
    allergies: String,
    chronicConditions: String,
    currentMedications: String,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    insurance: {
      provider: String,
      memberId: String,
      expiry: Date,
    },

    // Doctor fields
    specialization: String,
    registrationNumber: String,
    hospital: String,
    experience: Number,
    degrees: String,
    clinicAddress: String,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return await bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);