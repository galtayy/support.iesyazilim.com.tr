const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Geçerli bir email adresi giriniz.'),
    body('password').notEmpty().withMessage('Şifre giriniz.')
  ],
  authController.login
);

// Get current user route
router.get('/me', authenticate, authController.getCurrentUser);

// Change password route
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Mevcut şifrenizi giriniz.'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Yeni şifre en az 6 karakter olmalıdır.')
  ],
  authController.changePassword
);

module.exports = router;