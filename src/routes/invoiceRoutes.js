const express = require("express");
const router = express.Router();

// Destructure verifyToken from authMiddleware
const { verifyToken } = require("../middleware/authMiddleware");

const {
    getInvoiceData,
    downloadInvoicePDF
} = require("../controllers/invoiceController");

// Require authentication for invoice access
router.use(verifyToken);

// GET /api/invoices/:orderId (Returns JSON invoice data)
router.get("/:orderId", getInvoiceData);

// GET /api/invoices/:orderId/download (Streams downloadable PDF)
router.get("/:orderId/download", downloadInvoicePDF);

module.exports = router;