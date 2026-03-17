/**
 * Seed script — creates sample patient + doctor for development
 * Run: node src/utils/seed.js
 */
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const User = require('../models/User.model');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});

  await User.create([
    {
      name: 'Ravi Shankar',
      email: 'patient@demo.com',
      password: 'demo123',
      role: 'patient',
      phone: '+91 98456 12345',
      gender: 'Male',
      bloodGroup: 'B+',
      dateOfBirth: new Date('1988-07-14'),
      height: 172,
      weight: 74,
      address: '42, Anna Nagar, Chennai, TN - 600040',
      allergies: 'Penicillin, Dust',
      chronicConditions: 'Type 2 Diabetes, Hypertension',
      currentMedications: 'Metformin 500mg, Amlodipine 5mg',
      emergencyContact: { name: 'Meena Shankar', phone: '+91 94456 78901', relation: 'Spouse' },
      insurance: { provider: 'Star Health Insurance', memberId: 'SHI-2024-0847', expiry: new Date('2026-03-31') },
    },
    {
      name: 'Dr. Priya Kumar',
      email: 'doctor@demo.com',
      password: 'demo123',
      role: 'doctor',
      phone: '+91 98765 43210',
      specialization: 'General Physician',
      hospital: 'Apollo Hospital',
      registrationNumber: 'MCI-2010-45678',
      experience: 15,
      degrees: 'MBBS, MD (Internal Medicine)',
      clinicAddress: 'Apollo Hospitals, Greams Road, Chennai - 600006',
    },
  ]);

  console.log('✅ Seed data created');
  console.log('   Patient → email: patient@demo.com | password: demo123');
  console.log('   Doctor  → email: doctor@demo.com  | password: demo123');
  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });