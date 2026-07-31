const express = require('express');
const router = express.Router();
const {
    createDiscount,
    getActiveDiscounts,
    calculatePrice,
    disableDiscount
} = require('../controllers/discountController');

router.post('/', createDiscount);
router.get('/active', getActiveDiscounts);
router.get('/calculate/:productId', calculatePrice);
router.put('/:id/disable', disableDiscount); // Use PUT to soft-delete/disable

module.exports = router;