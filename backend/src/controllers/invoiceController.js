const pool = require("../config/db");
const PDFDocument = require("pdfkit");

// 1. GET INVOICE DATA (JSON Format for Frontend Display)
const getInvoiceData = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        // Fetch Order & Address Details
        const orderResult = await pool.query(
            `SELECT o.*, a.full_name, a.phone, a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.country
             FROM orders o
             JOIN addresses a ON o.address_id = a.id
             WHERE o.id = $1 AND o.user_id = $2`,
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: "Invoice or order not found." });
        }

        const order = orderResult.rows[0];

        // Fetch Order Items
        const itemsResult = await pool.query(
            `SELECT oi.id, oi.quantity, oi.price, (oi.quantity * oi.price) AS subtotal, p.name 
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [orderId]
        );

        res.status(200).json({
            invoice: {
                invoice_number: `INV-${order.id.toString().padStart(6, "0")}`,
                issue_date: order.created_at,
                payment_method: order.payment_method,
                status: order.status,
                customer: {
                    name: order.full_name,
                    phone: order.phone,
                    address: `${order.address_line1}, ${order.city}, ${order.country}`
                },
                items: itemsResult.rows,
                total_amount: order.total_amount
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error generating invoice data" });
    }
};

// 2. DOWNLOAD PDF INVOICE (Streams PDF file directly)
const downloadInvoicePDF = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const orderResult = await pool.query(
            `SELECT o.*, a.full_name, a.phone, a.address_line1, a.city, a.country
             FROM orders o
             JOIN addresses a ON o.address_id = a.id
             WHERE o.id = $1 AND o.user_id = $2`,
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: "Order not found." });
        }

        const order = orderResult.rows[0];

        const itemsResult = await pool.query(
            `SELECT oi.quantity, oi.price, p.name 
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [orderId]
        );

        const items = itemsResult.rows;

        // Initialize PDF Document
        const doc = new PDFDocument({ margin: 50 });

        // Set Headers for File Download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=invoice-order-${order.id}.pdf`);

        doc.pipe(res);

        // Header Section
        doc.fontSize(20).text("DOUBLE-H HARDWARE MARKETPLACE", { align: "center" }).moveDown(0.5);
        doc.fontSize(14).text(`INVOICE: INV-${order.id.toString().padStart(6, "0")}`, { align: "center" }).moveDown(1.5);

        // Customer Details Section
        doc.fontSize(10).text(`Customer Name: ${order.full_name}`);
        doc.text(`Phone: ${order.phone}`);
        doc.text(`Address: ${order.address_line1}, ${order.city}, ${order.country}`);
        doc.text(`Payment Method: ${order.payment_method}`);
        doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`).moveDown(1.5);

        // Items Table
        doc.fontSize(12).text("Items Purchased:", { underline: true }).moveDown(0.5);

        items.forEach((item, index) => {
            doc.fontSize(10).text(
                `${index + 1}. ${item.name} - ${item.quantity} x PKR ${item.price} = PKR ${(item.quantity * item.price).toFixed(2)}`
            );
        });

        doc.moveDown(1.5);
        doc.fontSize(12).text(`Grand Total: PKR ${order.total_amount}`, { bold: true });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error generating PDF invoice" });
    }
};

module.exports = {
    getInvoiceData,
    downloadInvoicePDF
};