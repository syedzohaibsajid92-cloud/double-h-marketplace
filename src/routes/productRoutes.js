const express = require("express");
const router = express.Router();

// Destructure role-based middleware from authMiddleware
const { verifyVendor, verifyAdmin } = require("../middleware/authMiddleware");

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get("/", getProducts);
router.get("/:id", getProductById);

// ==========================================
// PROTECTED ROUTES (Vendor / Admin Privileges Required)
// ==========================================
router.post("/", verifyVendor, createProduct);
router.put("/:id", verifyVendor, updateProduct);
router.delete("/:id", verifyAdmin, deleteProduct);

module.exports = router;