const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const {
    adjustStock,
    getLowStockProducts,
    getStockLogs
} = require('../controllers/stockController');

// Base path: /api/stock
router.post('/adjust', verifyAdmin, adjustStock);
router.get('/low-stock', verifyAdmin, getLowStockProducts);
router.get('/logs/:productId', verifyAdmin, getStockLogs);

module.exports = router;