const express = require("express");

const router = express.Router();

const {
    createCommission,
    getCommissions,
    getCommissionById
} = require("../controllers/commissionController");

// Create Commission
router.post("/", createCommission);

// Get All Commissions
router.get("/", getCommissions);

// Get Commission By ID
router.get("/:id", getCommissionById);

module.exports = router;