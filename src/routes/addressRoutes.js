const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require("../controllers/addressController");

// Add Address
router.post("/", authMiddleware, createAddress);

// Get All Addresses
router.get("/", authMiddleware, getAddresses);

// Get Address By ID
router.get("/:id", authMiddleware, getAddressById);

// Update Address
router.put("/:id", authMiddleware, updateAddress);

// Delete Address
router.delete("/:id", authMiddleware, deleteAddress);

// Set Default Address
router.patch("/:id/default", authMiddleware, setDefaultAddress);

module.exports = router;