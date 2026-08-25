const express = require("express");
const router = express.Router();

const { getVendorInventory, updateProductStock } = require("../controllers/inventoryController");
const {
    createVendor,
    getVendors,
    getVendorById,
    getMyVendor,
    updateVendor,
    deleteVendor
} = require("../controllers/vendorController");

const {
    submitVerification,
    getMyVerificationStatus
} = require("../controllers/vendorVerificationController");

// Destructure verifyToken from authMiddleware
const { verifyToken } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// =====================================
// Customer applies to become Vendor
// =====================================
router.post(
    "/register",
    verifyToken,
    authorizeRoles("Customer"),
    createVendor
);

// =====================================
// Vendor Verification - Submit documents
// =====================================
router.post(
    "/verification/submit",
    verifyToken,
    authorizeRoles("Customer", "Vendor"),
    submitVerification
);

// =====================================
// Vendor Verification - Check my status
// =====================================
router.get(
    "/verification/status",
    verifyToken,
    authorizeRoles("Customer", "Vendor"),
    getMyVerificationStatus
);

// =====================================
// Inventory Routes (Placed before /:id)
// =====================================
router.get("/inventory", verifyToken, getVendorInventory);
router.patch("/inventory/:productId/stock", verifyToken, updateProductStock);

// =====================================
// Logged-in user - Get My Vendor Profile
// =====================================
router.get(
    "/me",
    verifyToken,
    getMyVendor
);

// =====================================
// Admin - Get All Vendors
// =====================================
router.get(
    "/",
    verifyToken,
    authorizeRoles("Admin"),
    getVendors
);

// =====================================
// Admin - Get Vendor By ID
// =====================================
router.get(
    "/:id",
    verifyToken,
    authorizeRoles("Admin"),
    getVendorById
);

// =====================================
// Vendor/Admin - Update Vendor
// =====================================
router.put(
    "/:id",
    verifyToken,
    authorizeRoles("Vendor", "Admin"),
    updateVendor
);

// =====================================
// Admin - Delete Vendor
// =====================================
router.delete(
    "/:id",
    verifyToken,
    authorizeRoles("Admin"),
    deleteVendor
);

module.exports = router;