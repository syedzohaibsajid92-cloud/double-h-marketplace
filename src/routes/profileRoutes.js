const express = require("express");
const router = express.Router();

// Destructure verifyToken from authMiddleware
const { verifyToken } = require("../middleware/authMiddleware");

const {
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/profileController");

// ==============================
// Profile Routes
// ==============================

// Get logged-in user's profile
router.get("/", verifyToken, getProfile);

// Update logged-in user's profile
router.put("/", verifyToken, updateProfile);

// Change password
router.put("/change-password", verifyToken, changePassword);

module.exports = router;