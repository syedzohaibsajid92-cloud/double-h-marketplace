const express = require("express");

const router = express.Router();

const {
    createVendor,
    getVendors,
    getVendorById,
    updateVendor,
    deleteVendor
} = require("../controllers/vendorController");

// Create Vendor
router.post("/", createVendor);

// Get All Vendors
router.get("/", getVendors);

// Get Vendor By ID
router.get("/:id", getVendorById);

// Update Vendor
router.put("/:id", updateVendor);

// Delete Vendor
router.delete("/:id", deleteVendor);

module.exports = router;