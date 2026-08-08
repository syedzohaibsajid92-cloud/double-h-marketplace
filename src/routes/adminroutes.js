const express = require("express");
const router = express.Router();

// Destructure verifyToken (or verifyAdmin) from authMiddleware
const { verifyToken } = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");

const vendorCtrl = require("../controllers/adminVendorController");
const productCtrl = require("../controllers/adminproductController");
const analyticsCtrl = require("../controllers/adminAnalyticsController");
const couponCtrl = require("../controllers/coupenController");
const cmsCtrl = require("../controllers/CMSController");

// All admin routes require: valid JWT + role === 'admin'
router.use(verifyToken, requireAdmin);

// ---- Vendor Approval ----
router.get("/vendors/pending", vendorCtrl.getPendingVendors);
router.patch("/vendors/:id/approve", vendorCtrl.approveVendor);
router.patch("/vendors/:id/reject", vendorCtrl.rejectVendor);

// ---- Product Approval ----
router.get("/products/pending", productCtrl.getPendingProducts);
router.patch("/products/:id/approve", productCtrl.approveProduct);
router.patch("/products/:id/reject", productCtrl.rejectProduct);

// ---- Analytics ----
router.get("/analytics/overview", analyticsCtrl.getOverview);
router.get("/analytics/revenue-trends", analyticsCtrl.getRevenueTrends);

// ---- Coupons / Promotions ----
router.get("/coupons", couponCtrl.getCoupons);
router.post("/coupons", couponCtrl.createCoupon);
router.put("/coupons/:id", couponCtrl.updateCoupon);
router.delete("/coupons/:id", couponCtrl.deleteCoupon);

// ---- CMS ----
router.get("/cms", cmsCtrl.getPages);
router.get("/cms/:slug", cmsCtrl.getPageBySlug);
router.put("/cms/:slug", cmsCtrl.upsertPage);

module.exports = router;