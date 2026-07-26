const express = require("express");

const router = express.Router();

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterProducts
} = require("../controllers/productController");

// Search products
router.get("/search", searchProducts);

// Filter products
router.get("/filter", filterProducts);

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

// Create product
router.post("/", createProduct);

// Update product
router.put("/:id", updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

module.exports = router;