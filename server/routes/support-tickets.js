const express = require('express');
const { body } = require('express-validator');
const supportTicketController = require('../controllers/supportTicketController');
const { authenticate, isAdmin, isSupportOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Public endpoints (no auth required)
// Generate PDF for a ticket with token (for email links - no auth required)
router.get('/:id/pdf/:token', supportTicketController.generateTicketPDFWithToken);

// Public access to PDF (temporary solution)
router.get('/:id/public-pdf', supportTicketController.generatePublicPDF);

// All other routes require authentication
router.use(authenticate);

// Get all tickets (with filtering and pagination)
router.get('/', isSupportOrAdmin, supportTicketController.getAllTickets);

// Get ticket by ID
router.get('/:id', isSupportOrAdmin, supportTicketController.getTicketById);

// Create new ticket
router.post(
  '/',
  isSupportOrAdmin,
  [
    body('customerId').notEmpty().withMessage('Müşteri seçiniz.'),
    body('categoryId').notEmpty().withMessage('Kategori seçiniz.'),
    body('description').notEmpty().withMessage('İş açıklaması giriniz.'),
    body('startTime').notEmpty().withMessage('Başlangıç saati giriniz.'),
    body('endTime').notEmpty().withMessage('Bitiş saati giriniz.'),
    body('startTime').custom((value, { req }) => {
      const start = new Date(value);
      const end = new Date(req.body.endTime);
      if (start >= end) {
        throw new Error('Başlangıç saati bitiş saatinden önce olmalıdır.');
      }
      return true;
    })
  ],
  supportTicketController.createTicket
);

// Update ticket
router.put(
  '/:id',
  isSupportOrAdmin,
  [
    body('customerId').optional().notEmpty().withMessage('Müşteri seçiniz.'),
    body('categoryId').optional().notEmpty().withMessage('Kategori seçiniz.'),
    body('description').optional().notEmpty().withMessage('İş açıklaması giriniz.'),
    body('startTime').optional().notEmpty().withMessage('Başlangıç saati giriniz.'),
    body('endTime').optional().notEmpty().withMessage('Bitiş saati giriniz.'),
    body('startTime').optional().custom((value, { req }) => {
      if (!req.body.endTime) return true;
      const start = new Date(value);
      const end = new Date(req.body.endTime);
      if (start >= end) {
        throw new Error('Başlangıç saati bitiş saatinden önce olmalıdır.');
      }
      return true;
    }),
    body('endTime').optional().custom((value, { req }) => {
      if (!req.body.startTime) return true;
      const start = new Date(req.body.startTime);
      const end = new Date(value);
      if (start >= end) {
        throw new Error('Bitiş saati başlangıç saatinden sonra olmalıdır.');
      }
      return true;
    })
  ],
  supportTicketController.updateTicket
);

// Update ticket status (admin only)
router.put(
  '/:id/status',
  isAdmin,
  [
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Geçerli bir durum giriniz (approved/rejected).')
  ],
  supportTicketController.updateTicketStatus
);

// Delete ticket
router.delete('/:id', isSupportOrAdmin, supportTicketController.deleteTicket);

// Upload image for a ticket
router.post('/:id/images', isSupportOrAdmin, supportTicketController.uploadTicketImage);

// Delete ticket image
router.delete('/:id/images/:imageId', isSupportOrAdmin, supportTicketController.deleteTicketImage);

// Generate PDF for a ticket - auth still required but use auth from the client API call
router.get('/:id/pdf', isSupportOrAdmin, supportTicketController.generateTicketPDF);

module.exports = router;