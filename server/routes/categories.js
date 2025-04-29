const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get single category by ID
router.get('/:id', categoryController.getCategoryById);

// Admin only routes
// Create new category
router.post(
  '/',
  isAdmin,
  [
    body('name').notEmpty().withMessage('Kategori adı giriniz.'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Geçerli bir hex renk kodu giriniz (#RRGGBB).')
  ],
  categoryController.createCategory
);

// Update category
router.put(
  '/:id',
  isAdmin,
  [
    body('name').optional().notEmpty().withMessage('Kategori adı giriniz.'),
    body('color')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('Geçerli bir hex renk kodu giriniz (#RRGGBB).'),
    body('active').optional().isBoolean().withMessage('Aktif alanı boolean olmalıdır.')
  ],
  categoryController.updateCategory
);

// Delete category
router.delete('/:id', isAdmin, categoryController.deleteCategory);

module.exports = router;