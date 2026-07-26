const express = require("express");
const router = express.Router();

const {
    makePayment,
    getPaymentHistory
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

// Make Payment
router.post("/pay", authMiddleware, makePayment);

// Payment History
router.get("/history", authMiddleware, getPaymentHistory);

module.exports = router;