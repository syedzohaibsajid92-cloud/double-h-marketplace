const express = require('express');
const router = express.Router();
const { getVendorAnalytics } = require('../controllers/analyticsController');

// Destructure verifyToken from authMiddleware
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/analytics - High level vendor analytics dashboard
router.get('/', verifyToken, getVendorAnalytics);

module.exports = router;