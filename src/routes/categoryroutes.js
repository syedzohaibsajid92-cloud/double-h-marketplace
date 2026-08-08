const express = require("express");
const router = express.Router();

// Destructure the required middleware functions
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

// Public/Authenticated category fetching
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin-only endpoints
router.post("/", verifyAdmin, createCategory);
router.put("/:id", verifyAdmin, updateCategory);
router.delete("/:id", verifyAdmin, deleteCategory);

module.exports = router;