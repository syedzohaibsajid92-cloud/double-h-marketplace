const express = require("express");

const router = express.Router();

const {
    getVendorDashboard
} = require("../controllers/vendorDashboardController");

router.get("/:vendorId", getVendorDashboard);

module.exports = router;