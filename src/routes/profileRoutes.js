const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/profileController");

// ==============================
// Profile Routes
// ==============================

// Get logged-in user's profile
router.get("/", authMiddleware, getProfile);

// Update logged-in user's profile
router.put("/", authMiddleware, updateProfile);

// Change password
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;