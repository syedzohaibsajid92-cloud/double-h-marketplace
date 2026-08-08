const express = require('express');
const router = express.Router();
const { getRevenueSummary, getMonthlyRevenueReport } = require('../controllers/revenueController');

// Destructure verifyToken from authMiddleware
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/summary', verifyToken, getRevenueSummary);
router.get('/monthly', verifyToken, getMonthlyRevenueReport);

module.exports = router;