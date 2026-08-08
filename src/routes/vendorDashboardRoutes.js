const express = require("express");
const router = express.Router();

const { getVendorDashboard } = require("../controllers/vendordashboardController");

// Destructure verifyToken (or verifyVendor) from authMiddleware
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/:vendorId", verifyToken, getVendorDashboard);

module.exports = router;