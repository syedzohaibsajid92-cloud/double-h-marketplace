const express = require('express');
const router = express.Router();
const { 
    getVendorInventory, 
    updateProductStock, 
    getStockLogs 
} = require('../controllers/inventoryController'); // Make sure path matches your controllers folder
const protect = require('../middleware/authMiddleware'); // Standard auth middleware used across your routes

// 1. Get current logged-in vendor's inventory list & status
router.get('/', protect, getVendorInventory);

// 2. Update product stock level (updates product stock + logs entry in inventory table)
router.put('/product/:productId', protect, updateProductStock);

// 3. Get stock movement audit trail/history for a specific product
router.get('/product/:productId/logs', protect, getStockLogs);

module.exports = router;