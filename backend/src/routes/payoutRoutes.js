const express = require('express');
const router = express.Router();
const { requestPayout, getPayoutHistory } = require('../controllers/payoutController');

// Destructure verifyToken from authMiddleware
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/payouts/request - Request payout
router.post('/request', verifyToken, requestPayout);

// GET /api/payouts/history - View past payouts
router.get('/history', verifyToken, getPayoutHistory);

module.exports = router;