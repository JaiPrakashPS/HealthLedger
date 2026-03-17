const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const morgan     = require('morgan');
const dotenv     = require('dotenv');

dotenv.config();

const authRoutes        = require('./src/routes/auth.routes');
const userRoutes        = require('./src/routes/user.routes');
const recordRoutes      = require('./src/routes/record.routes');
const accessLinkRoutes  = require('./src/routes/accessLink.routes');
const appointmentRoutes = require('./src/routes/appointment.routes');
const doctorRoutes      = require('./src/routes/doctor.routes');
const notificationRoutes= require('./src/routes/notification.routes');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/records',      recordRoutes);
app.use('/api/access-links', accessLinkRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/notifications',notificationRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Healthledger API is running', timestamp: new Date() });
});

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Connect DB & Start ────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected:', process.env.MONGO_URI);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });