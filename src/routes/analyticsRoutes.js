const express = require('express');
const router = express.Router();
const { getVendorAnalytics } = require('../controllers/analyticsController');
const protect = require('../middleware/authMiddleware');

// GET /api/analytics - High level vendor analytics dashboard
router.get('/', protect, getVendorAnalytics);

module.exports = router;