const express = require('express');
const router = express.Router();
const { getRevenueSummary, getMonthlyRevenueReport } = require('../controllers/revenueController');

// Destructure verifyToken from authMiddleware
const { verifyAdmin } = require('../middleware/authMiddleware');

router.get('/summary', verifyAdmin, getRevenueSummary);
router.get('/monthly', verifyAdmin, getMonthlyRevenueReport);

module.exports = router;