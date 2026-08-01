const express = require("express");
const router = express.Router();

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

// 1. Commission & Payout Reports (Task 4)
router.get("/reports", getCommissionReports);

// 2. Commission Calculation Engine
router.post("/calculate", calculateOrderCommission);

// 3. Vendor Earnings Ledger
router.get("/vendor/:vendor_id/ledger", getVendorLedger);

// 4. Withdrawal Workflow
router.post("/withdraw", requestWithdrawal);
router.patch("/withdraw/:id/status", updateWithdrawalStatus);

// 5. Commission CRUD
router.post("/", createCommission);
router.get("/", getCommissions);
router.get("/:id", getCommissionById);

module.exports = router;