const express = require('express');
const router = express.Router();
const { requestPayout, getPayoutHistory } = require('../controllers/payoutController');
const protect = require('../middleware/authMiddleware');

// POST /api/payouts/request - Request payout
router.post('/request', protect, requestPayout);

// GET /api/payouts/history - View past payouts
router.get('/history', protect, getPayoutHistory);

module.exports = router;