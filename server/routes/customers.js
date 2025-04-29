const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controllers/customerController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all customers
router.get('/', customerController.getAllCustomers);

// Get active customers
router.get('/active', customerController.getActiveCustomers);

// Get single customer by ID
router.get('/:id', customerController.getCustomerById);

// Admin only routes
// Create new customer
router.post(
  '/',
  isAdmin,
  [
    body('name').notEmpty().withMessage('Müşteri adı giriniz.'),
    body('contactEmail')
      .optional()
      .isEmail()
      .withMessage('Geçerli bir email adresi giriniz.')
  ],
  customerController.createCustomer
);

// Update customer
router.put(
  '/:id',
  isAdmin,
  [
    body('name').optional().notEmpty().withMessage('Müşteri adı giriniz.'),
    body('contactEmail')
      .optional()
      .isEmail()
      .withMessage('Geçerli bir email adresi giriniz.'),
    body('active').optional().isBoolean().withMessage('Aktif alanı boolean olmalıdır.')
  ],
  customerController.updateCustomer
);

// Delete customer
router.delete('/:id', isAdmin, customerController.deleteCustomer);

module.exports = router;