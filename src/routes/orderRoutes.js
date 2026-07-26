const express = require("express");
const router = express.Router();

const {
    placeOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

// Get all orders
router.get("/", getAllOrders);

// Place a new order
router.post("/", placeOrder);

// Get all orders of a user
router.get("/:userId", authMiddleware, getUserOrders);

// Get a single order
router.get("/details/:id", authMiddleware, getOrderById);

// Cancel an order
router.delete("/:id", authMiddleware, cancelOrder);

module.exports = router;