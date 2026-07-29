const express = require("express");

const router = express.Router();

const {
    getVendorDashboard
} = require("../controllers/vendorDashboardController");

const verifyToken = require("../middleware/authMiddleware");

router.get("/:vendorId", verifyToken, getVendorDashboard);

module.exports = router;