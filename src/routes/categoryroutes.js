const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

// Anyone with a valid JWT can view categories
router.get("/", authMiddleware, getCategories);

router.get("/:id", authMiddleware, getCategoryById);

// Only Admin can create categories
router.post(
    "/",
    authMiddleware,
    authorizeRoles("Admin"),
    createCategory
);

// Only Admin can update categories
router.put(
    "/:id",
    authMiddleware,
    authorizeRoles("Admin"),
    updateCategory
);

// Only Admin can delete categories
router.delete(
    "/:id",
    authMiddleware,
    authorizeRoles("Admin"),
    deleteCategory
);

module.exports = router;