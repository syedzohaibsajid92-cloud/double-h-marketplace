const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/authMiddleware');
const {
    createDiscount,
    getActiveDiscounts,
    calculatePrice,
    disableDiscount
} = require('../controllers/discountController');

router.post('/', verifyAdmin, createDiscount);
router.get('/active', getActiveDiscounts);
router.get('/calculate/:productId', calculatePrice);
router.put('/:id/disable', verifyAdmin, disableDiscount);

module.exports = router;