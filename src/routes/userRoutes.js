const express = require("express");
const router = express.Router();

// Destructure role-based middleware
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers
} = require("../controllers/userController");

// ==========================================
// PUBLIC / GENERAL ROUTES
// ==========================================
// Create user (Public registration / onboarding)
router.post("/", createUser);

// ==========================================
// PROTECTED USER ROUTES (Authentication Required)
// ==========================================
// Get profile by ID & Update profile
router.get("/:id", verifyToken, getUserById);
router.put("/:id", verifyToken, updateUser);

// ==========================================
// PROTECTED ADMIN ROUTES (Admin Privileges Required)
// ==========================================
// Admin endpoints to view all users and delete user accounts
router.get("/", verifyAdmin, getUsers);
router.get("/all", verifyAdmin, getAllUsers);
router.delete("/:id", verifyAdmin, deleteUser);

module.exports = router;