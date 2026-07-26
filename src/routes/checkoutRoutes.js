const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { getCheckoutSummary } = require("../controllers/checkoutController");

// Checkout summary route
router.get("/summary", verifyToken, getCheckoutSummary);

module.exports = router;