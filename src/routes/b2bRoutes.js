const express = require("express");
const router = express.Router();

const {
    validateMOQ,
    calculateBulkOrder,
    submitRFQ,
    generateQuotation,
    respondToQuotation,
    createPurchaseOrder,
    generateGSTInvoice,
    getInvoiceById,
    createB2BRequest,
    getAllB2BRequests,
    getB2BRequestById,
    updateB2BStatus
} = require("../controllers/b2bController");

// Task 1: MOQ Validation Rule
router.post("/validate-moq", validateMOQ);

// Task 2: Bulk Order Handling
router.post("/bulk-calculate", calculateBulkOrder);

// Task 3: Request for Quotation (RFQ)
router.post("/rfq", submitRFQ);

// Task 4: Quotation Generation & Approval
router.post("/quotations", generateQuotation);
router.patch("/quotations/:id/respond", respondToQuotation);

// Task 5: B2B Requests Workflow
router.post("/requests", createB2BRequest);
router.get("/requests", getAllB2BRequests);
router.get("/requests/:id", getB2BRequestById);
router.patch("/requests/:id/status", updateB2BStatus);

// Task 6: Purchase Order Handling
router.post("/purchase-orders", createPurchaseOrder);

// Task 7: GST Invoice Generation
router.post("/invoices/gst", generateGSTInvoice);
router.get("/invoices/gst/:id", getInvoiceById);

module.exports = router;