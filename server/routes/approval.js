const express = require('express');
const approvalController = require('../controllers/approvalController');
const { authenticate, isAdmin, isSupportOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Routes that require authentication
router.use('/send/:id', authenticate, isSupportOrAdmin, approvalController.sendApprovalEmail);

// Public routes (no authentication required)
router.get('/verify/:token', approvalController.verifyApprovalToken);
router.post('/process/:token/:action', approvalController.processExternalApproval);

module.exports = router;