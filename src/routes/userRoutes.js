const express = require("express");

const router = express.Router();

const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers
} = require("../controllers/userController");

// Get all users
router.get("/", getUsers);

// Admin - Get all users
router.get("/all", getAllUsers);

// Get user by id
router.get("/:id", getUserById);

// Update user
router.put("/:id", updateUser);

// Delete user
router.delete("/:id", deleteUser);

// Create user
router.post("/", createUser);

module.exports = router;

// Create user
router.post("/", createUser);

module.exports = router;