const express = require("express");

const router = express.Router();

const {
    createB2BRequest,
    getAllB2BRequests,
    getB2BRequestById,
    updateB2BStatus
} = require("../controllers/b2bController");

// Create B2B Request
router.post("/", createB2BRequest);

// Get All B2B Requests
router.get("/", getAllB2BRequests);

// Get B2B Request By ID
router.get("/:id", getB2BRequestById);

// Update B2B Request Status
router.put("/:id", updateB2BStatus);

module.exports = router;