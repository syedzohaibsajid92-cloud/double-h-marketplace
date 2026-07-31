const express = require('express');
const router = express.Router();
const {
    adjustStock,
    getLowStockProducts,
    getStockLogs
} = require('../controllers/stockController');

// Base path: /api/stock
router.post('/adjust', adjustStock);
router.get('/low-stock', getLowStockProducts);
router.get('/logs/:productId', getStockLogs);

module.exports = router;