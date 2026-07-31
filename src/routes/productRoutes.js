const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

// Public routes (search & filtering are handled via query params in GET /)
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes (Vendor Authentication Required)
router.post("/", verifyToken, createProduct);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

module.exports = router;