const express = require("express");
const router = express.Router();
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const {
    calculateOrderCommission,
    createCommission,
    getCommissions,
    getCommissionById,
    getVendorLedger,
    requestWithdrawal,
    updateWithdrawalStatus,
    getCommissionReports
} = require("../controllers/commissionController");

router.get("/reports", verifyAdmin, getCommissionReports);
router.post("/calculate", verifyAdmin, calculateOrderCommission);
router.get("/vendor/:vendor_id/ledger", verifyToken, getVendorLedger);
router.post("/withdraw", verifyToken, requestWithdrawal);
router.patch("/withdraw/:id/status", verifyAdmin, updateWithdrawalStatus);
router.post("/", verifyAdmin, createCommission);
router.get("/", verifyAdmin, getCommissions);
router.get("/:id", verifyAdmin, getCommissionById);

module.exports = router;