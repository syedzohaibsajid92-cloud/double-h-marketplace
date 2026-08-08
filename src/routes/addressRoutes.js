const express = require("express");
const router = express.Router();

// Destructure verifyToken from authMiddleware
const { verifyToken } = require("../middleware/authMiddleware");

const {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require("../controllers/addressController");

// Add Address
router.post("/", verifyToken, createAddress);

// Get All Addresses
router.get("/", verifyToken, getAddresses);

// Get Address By ID
router.get("/:id", verifyToken, getAddressById);

// Update Address
router.put("/:id", verifyToken, updateAddress);

// Delete Address
router.delete("/:id", verifyToken, deleteAddress);

// Set Default Address
router.patch("/:id/default", verifyToken, setDefaultAddress);

module.exports = router;