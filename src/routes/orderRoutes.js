const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    placeOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders
} = require("../controllers/orderController");

// Protect ALL order routes with authMiddleware
router.use(authMiddleware);

// Customer endpoints
router.post("/", placeOrder);
router.get("/user", getUserOrders);          // GET /api/orders/user
router.get("/details/:id", getOrderById);    // GET /api/orders/details/:id
router.put("/cancel/:id", cancelOrder);      // PUT /api/orders/cancel/:id

// Admin endpoint (Will attach admin middleware here later)
router.get("/admin/all", getAllOrders);

module.exports = router;