const express = require("express");
const router = express.Router();

const {
    createDispute,
    resolveDispute,
    getDisputes,
    getDisputeById,
    updateDisputeStatus
} = require("../controllers/disputeController");

// Create Dispute (Refund, Replacement, Wrong Item, Damaged Product, Missing Shipment, Evidence Upload)
router.post("/", createDispute);

// Get All Disputes
router.get("/", getDisputes);

// Get Dispute By ID
router.get("/:id", getDisputeById);

// Admin Review & Resolution Workflow (Task 7)
router.patch("/:id/resolve", resolveDispute);

// Generic Dispute Status Update
router.put("/:id", updateDisputeStatus);

module.exports = router;