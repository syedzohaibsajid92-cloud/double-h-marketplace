const express = require('express');
const router = express.Router();
const { 
    getSalesSummary, 
    getSalesHistory, 
    getTopSellingProducts 
} = require('../controllers/salesController');

// Destructure verifyToken from authMiddleware
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/sales/summary - High level sales stats
router.get('/summary', verifyToken, getSalesSummary);

// GET /api/sales/history - Detailed list of sold items
router.get('/history', verifyToken, getSalesHistory);

// GET /api/sales/top-products - Vendor's top 5 products by quantity sold
router.get('/top-products', verifyToken, getTopSellingProducts);

module.exports = router;