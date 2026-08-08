const express = require("express");
const router = express.Router();

// Destructure verifyToken from authMiddleware
const { verifyToken } = require("../middleware/authMiddleware");

const {
    createStripePaymentIntent,
    confirmStripePayment,
    makePayment,
    getPaymentHistory
} = require("../controllers/paymentController");

// Protect payment endpoints with JWT authentication
router.post("/create-intent", verifyToken, createStripePaymentIntent);
router.post("/confirm", verifyToken, confirmStripePayment);
router.post("/process", verifyToken, makePayment);
router.get("/history", verifyToken, getPaymentHistory);

module.exports = router;