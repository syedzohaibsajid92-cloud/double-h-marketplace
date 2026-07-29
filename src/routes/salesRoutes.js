const express = require('express');
const router = express.Router();
const { 
    getSalesSummary, 
    getSalesHistory, 
    getTopSellingProducts 
} = require('../controllers/salesController');
const protect = require('../middleware/authMiddleware');

// GET /api/sales/summary - High level sales stats
router.get('/summary', protect, getSalesSummary);

// GET /api/sales/history - Detailed list of sold items
router.get('/history', protect, getSalesHistory);

// GET /api/sales/top-products - Vendor's top 5 products by quantity sold
router.get('/top-products', protect, getTopSellingProducts);

module.exports = router;