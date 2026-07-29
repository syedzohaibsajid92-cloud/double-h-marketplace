const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterProducts
} = require("../controllers/productController");

// Public routes
router.get("/search", searchProducts);
router.get("/filter", filterProducts);
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes (Require Authentication)
router.post("/", verifyToken, createProduct);       // <-- Added verifyToken
router.put("/:id", verifyToken, updateProduct);    // <-- Added verifyToken
router.delete("/:id", verifyToken, deleteProduct); // <-- Added verifyToken

module.exports = router;