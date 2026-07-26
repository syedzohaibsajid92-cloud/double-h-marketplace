const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

const {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
} = require("../controllers/cartController");

// Secure routes using verifyToken middleware
router.post("/", verifyToken, addToCart);
router.get("/", verifyToken, getCart); // No longer needs /:user_id parameter!
router.put("/:id", verifyToken, updateCartQuantity);
router.delete("/:id", verifyToken, removeFromCart);

module.exports = router;