const express = require("express");
const router = express.Router();

// Destructure verifyToken from the exports object
const { verifyToken } = require("../middleware/authMiddleware");

const {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
} = require("../controllers/cartController");

// Secure routes using verifyToken middleware
router.post("/", verifyToken, addToCart);
router.get("/", verifyToken, getCart);
router.put("/:id", verifyToken, updateCartQuantity);
router.delete("/:id", verifyToken, removeFromCart);

module.exports = router;