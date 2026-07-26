const express = require("express");

const router = express.Router();

const {
    getDashboardStats
} = require("../controllers/dashboardController");

// Dashboard Statistics
router.get("/stats", getDashboardStats);

module.exports = router;