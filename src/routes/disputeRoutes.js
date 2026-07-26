const express = require("express");

const router = express.Router();

const {
    createDispute,
    getDisputes,
    getDisputeById,
    updateDisputeStatus
} = require("../controllers/disputeController");

// Create Dispute
router.post("/", createDispute);

// Get All Disputes
router.get("/", getDisputes);

// Get Dispute By ID
router.get("/:id", getDisputeById);

// Update Dispute Status
router.put("/:id", updateDisputeStatus);

module.exports = router;