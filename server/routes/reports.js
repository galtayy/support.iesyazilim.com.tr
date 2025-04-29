const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get monthly summary report (admin only)
router.get('/monthly-summary', isAdmin, reportController.getMonthlySummary);

// Get detailed report for a period (admin only)
router.get('/detailed', isAdmin, reportController.getDetailedReport);

// Get staff performance report (admin only)
router.get('/staff-performance', isAdmin, reportController.getStaffPerformance);

module.exports = router;