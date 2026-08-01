const express = require("express");
const router = express.Router();

const {
    createStripePaymentIntent,
    confirmStripePayment,
    makePayment,
    getPaymentHistory
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

// Stripe Routes
router.post("/stripe/create-intent", authMiddleware, createStripePaymentIntent);
router.post("/stripe/confirm", authMiddleware, confirmStripePayment);

// Standard/Manual Payment Routes
router.post("/pay", authMiddleware, makePayment);
router.get("/history", authMiddleware, getPaymentHistory);

module.exports = router;