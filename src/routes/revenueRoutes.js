const express = require('express');
const router = express.Router();
const { getRevenueSummary, getMonthlyRevenueReport } = require('../controllers/revenueController');
const protect = require('../middleware/authMiddleware');

router.get('/summary', protect, getRevenueSummary);
router.get('/monthly', protect, getMonthlyRevenueReport);

module.exports = router;