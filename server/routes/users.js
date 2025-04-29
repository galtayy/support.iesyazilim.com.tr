const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users
router.get('/', isAdmin, userController.getAllUsers);

// Get single user by ID
router.get('/:id', isAdmin, userController.getUserById);

// Create new user (admin only)
router.post(
  '/',
  isAdmin,
  [
    body('firstName').notEmpty().withMessage('Ad giriniz.'),
    body('lastName').notEmpty().withMessage('Soyad giriniz.'),
    body('email').isEmail().withMessage('Geçerli bir email adresi giriniz.'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır.'),
    body('role').isIn(['admin', 'support']).withMessage('Geçerli bir rol giriniz.')
  ],
  userController.createUser
);

// Update user
router.put(
  '/:id',
  isAdmin,
  [
    body('firstName').optional().notEmpty().withMessage('Ad giriniz.'),
    body('lastName').optional().notEmpty().withMessage('Soyad giriniz.'),
    body('email').optional().isEmail().withMessage('Geçerli bir email adresi giriniz.'),
    body('role').optional().isIn(['admin', 'support']).withMessage('Geçerli bir rol giriniz.'),
    body('active').optional().isBoolean().withMessage('Aktif alanı boolean olmalıdır.')
  ],
  userController.updateUser
);

// Reset user password (admin only)
router.post(
  '/:id/reset-password',
  isAdmin,
  [
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Yeni şifre en az 6 karakter olmalıdır.')
  ],
  userController.resetPassword
);

// Delete user (admin only)
router.delete('/:id', isAdmin, userController.deleteUser);

module.exports = router;