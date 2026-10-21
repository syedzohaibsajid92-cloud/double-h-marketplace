const express = require('express');
const router = express.Router();
const { 
    getVendorInventory, 
    updateProductStock, 
    getStockLogs 
} = require('../controllers/inventoryController');

// Destructure verifyToken from authMiddleware
const { verifyToken } = require('../middleware/authMiddleware');

// 1. Get current logged-in vendor's inventory list & status
router.get('/', verifyToken, getVendorInventory);

// 2. Update product stock level (updates product stock + logs entry in inventory table)
router.put('/product/:productId', verifyToken, updateProductStock);

// 3. Get stock movement audit trail/history for a specific product
router.get('/product/:productId/logs', verifyToken, getStockLogs);

module.exports = router;