const express = require("express");
const router = express.Router();

// Destructure middleware functions
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const {
    placeOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    getInvoice,
    updateOrderStatus
} = require("../controllers/orderController");

// Protect ALL order routes with authentication (requires valid login token)
router.use(verifyToken);

// ==========================================
// CUSTOMER ENDPOINTS
// ==========================================
router.post("/", placeOrder);
router.get("/user", getUserOrders);          // GET /api/orders/user
router.get("/details/:id", getOrderById);    // GET /api/orders/details/:id
router.get("/invoice/:id", getInvoice);      // GET /api/orders/invoice/:id
router.put("/cancel/:id", cancelOrder);      // PUT /api/orders/cancel/:id

// ==========================================
// ADMIN ENDPOINTS (Protected with Admin Privilege)
// ==========================================
router.get("/admin/all", verifyAdmin, getAllOrders);       // GET /api/orders/admin/all
router.put("/status/:id", verifyAdmin, updateOrderStatus); // PUT /api/orders/status/:id

module.exports = router;