const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const { register, login, getMe, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate    = require('../middleware/validate.middleware');

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Min 6 characters'),
  body('role').isIn(['patient', 'doctor']).withMessage('Role must be patient or doctor'),
], validate, register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, login);

router.get('/me',              protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;