const pool = require("../config/db");

// ==========================================
// TASK 1: MOQ VALIDATION RULE
// ==========================================
const validateMOQ = async (req, res) => {
    try {
        const { product_id, quantity } = req.body;

        if (!product_id || !quantity) {
            return res.status(400).json({ message: "product_id and quantity are required." });
        }

        const productRes = await pool.query(
            "SELECT id, name, moq, price FROM products WHERE id = $1",
            [product_id]
        );

        if (productRes.rows.length === 0) {
            return res.status(404).json({ message: "Product not found." });
        }

        const product = productRes.rows[0];
        const minQty = product.moq || 1;

        if (parseInt(quantity) < minQty) {
            return res.status(400).json({
                is_valid: false,
                message: `Quantity (${quantity}) is below Minimum Order Quantity (MOQ) of ${minQty} for product ${product.name}.`,
                moq: minQty
            });
        }

        res.status(200).json({
            is_valid: true,
            message: "MOQ requirement met.",
            product_id: product.id,
            quantity: parseInt(quantity)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error validating MOQ." });
    }
};

// ==========================================
// TASK 2: BULK ORDER DISCOUNT CALCULATOR
// ==========================================
const calculateBulkOrder = async (req, res) => {
    try {
        const { items } = req.body; // Array of { product_id, quantity }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items array is required." });
        }

        let totalOriginal = 0;
        let totalDiscounted = 0;
        const processedItems = [];

        for (const item of items) {
            const productRes = await pool.query(
                "SELECT id, name, price, moq FROM products WHERE id = $1",
                [item.product_id]
            );

            if (productRes.rows.length === 0) continue;

            const product = productRes.rows[0];
            const qty = parseInt(item.quantity);
            const unitPrice = parseFloat(product.price);
            
            // Tiered bulk discount logic
            let discountPercent = 0;
            if (qty >= 100) discountPercent = 20;      // 20% off for 100+ units
            else if (qty >= 50) discountPercent = 15;  // 15% off for 50+ units
            else if (qty >= 20) discountPercent = 10;  // 10% off for 20+ units

            const itemOriginalTotal = unitPrice * qty;
            const itemDiscountAmount = (itemOriginalTotal * discountPercent) / 100;
            const itemFinalTotal = itemOriginalTotal - itemDiscountAmount;

            totalOriginal += itemOriginalTotal;
            totalDiscounted += itemFinalTotal;

            processedItems.push({
                product_id: product.id,
                name: product.name,
                quantity: qty,
                unit_price: unitPrice.toFixed(2),
                discount_percent: `${discountPercent}%`,
                line_total: itemFinalTotal.toFixed(2)
            });
        }

        res.status(200).json({
            summary: {
                total_original_price: totalOriginal.toFixed(2),
                total_discount_amount: (totalOriginal - totalDiscounted).toFixed(2),
                total_bulk_price: totalDiscounted.toFixed(2)
            },
            items: processedItems
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error calculating bulk order." });
    }
};

// ==========================================
// TASK 5: B2B REQUESTS (EXISTING CODE)
// ==========================================

// Create B2B Request
const createB2BRequest = async (req, res) => {
    try {
        const {
            user_id,
            company_name,
            contact_person,
            business_email,
            business_phone,
            request_details
        } = req.body;

        const result = await pool.query(
            `INSERT INTO b2b_requests
            (
                user_id,
                company_name,
                contact_person,
                business_email,
                business_phone,
                request_details
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *`,
            [
                user_id,
                company_name,
                contact_person,
                business_email,
                business_phone,
                request_details
            ]
        );

        res.status(201).json({
            message: "B2B request submitted successfully",
            request: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Invalid User ID"
            });
        }

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get All B2B Requests
const getAllB2BRequests = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM b2b_requests ORDER BY id ASC"
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get B2B Request By ID
const getB2BRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM b2b_requests WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "B2B request not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Update B2B Request Status
const updateB2BStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            `UPDATE b2b_requests
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "B2B request not found"
            });
        }

        res.status(200).json({
            message: "Status updated successfully",
            request: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};
// ==========================================
// TASK 3: REQUEST FOR QUOTATION (RFQ) WORKFLOW
// ==========================================
const submitRFQ = async (req, res) => {
    const client = await pool.connect();
    try {
        const { user_id, company_name, contact_email, notes, items } = req.body;

        if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "user_id and a valid items array are required." });
        }

        await client.query('BEGIN'); // Start transaction

        // 1. Insert master RFQ record
        const rfqRes = await client.query(
            `INSERT INTO rfqs (user_id, company_name, contact_email, notes)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [user_id, company_name, contact_email, notes || '']
        );
        const rfq = rfqRes.rows[0];

        // 2. Insert RFQ items
        const processedItems = [];
        for (const item of items) {
            const itemRes = await client.query(
                `INSERT INTO rfq_items (rfq_id, product_id, quantity, target_price)
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [rfq.id, item.product_id, item.quantity, item.target_price || null]
            );
            processedItems.push(itemRes.rows[0]);
        }

        await client.query('COMMIT'); // Save transaction

        res.status(201).json({
            message: "RFQ submitted successfully.",
            rfq: rfq,
            items: processedItems
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Revert changes if anything fails
        console.error("RFQ Submission Error:", error);
        res.status(500).json({ message: "Server Error submitting RFQ." });
    } finally {
        client.release();
    }
};
// ==========================================
// TASK 4: QUOTATION GENERATION & APPROVAL
// ==========================================

// 1. Generate Quotation (Admin/Vendor side)
const generateQuotation = async (req, res) => {
    try {
        const { rfq_id, vendor_id, total_quoted_price, admin_notes } = req.body;

        if (!rfq_id || !total_quoted_price) {
            return res.status(400).json({ message: "rfq_id and total_quoted_price are required." });
        }

        // Insert new Quotation
        const quoteRes = await pool.query(
            `INSERT INTO quotations (rfq_id, vendor_id, total_quoted_price, status, admin_notes)
             VALUES ($1, $2, $3, 'sent', $4)
             RETURNING *;`,
            [rfq_id, vendor_id || 1, total_quoted_price, admin_notes || '']
        );

        // Update RFQ status to 'quoted'
        await pool.query("UPDATE rfqs SET status = 'quoted', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [rfq_id]);

        res.status(201).json({
            message: "Quotation generated and sent to buyer successfully.",
            quotation: quoteRes.rows[0]
        });

    } catch (error) {
        console.error("Quotation Generation Error:", error);
        res.status(500).json({ message: "Server Error generating quotation." });
    }
};

// 2. Buyer Accept/Reject Quotation
const respondToQuotation = async (req, res) => {
    try {
        const { id } = req.params; // quotation_id
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Status must be 'approved' or 'rejected'." });
        }

        const quoteRes = await pool.query(
            `UPDATE quotations 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *;`,
            [status, id]
        );

        if (quoteRes.rows.length === 0) {
            return res.status(404).json({ message: "Quotation not found." });
        }

        const updatedQuote = quoteRes.rows[0];

        // Also update parent RFQ status
        await pool.query("UPDATE rfqs SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [status, updatedQuote.rfq_id]);

        res.status(200).json({
            message: `Quotation ${status} successfully.`,
            quotation: updatedQuote
        });

    } catch (error) {
        console.error("Quotation Response Error:", error);
        res.status(500).json({ message: "Server Error responding to quotation." });
    }
};
// ==========================================
// TASK 6: PURCHASE ORDER (PO) HANDLING
// ==========================================
const createPurchaseOrder = async (req, res) => {
    try {
        const { quotation_id, po_number, company_name, billing_address, shipping_address } = req.body;

        if (!quotation_id || !po_number) {
            return res.status(400).json({ message: "quotation_id and po_number are required." });
        }

        // 1. Fetch quotation details
        const quoteRes = await pool.query("SELECT * FROM quotations WHERE id = $1", [quotation_id]);
        if (quoteRes.rows.length === 0) {
            return res.status(404).json({ message: "Quotation not found." });
        }

        const quotation = quoteRes.rows[0];

        // 2. Create Purchase Order
        const poRes = await pool.query(
            `INSERT INTO purchase_orders 
             (po_number, quotation_id, company_name, total_amount, billing_address, shipping_address)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *;`,
            [
                po_number,
                quotation_id,
                company_name || 'Corporate Buyer',
                quotation.total_quoted_price,
                billing_address || '',
                shipping_address || ''
            ]
        );

        // 3. Mark quotation status as approved/converted
        await pool.query("UPDATE quotations SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [quotation_id]);

        res.status(201).json({
            message: "Purchase Order created successfully.",
            purchase_order: poRes.rows[0]
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: "Purchase Order (PO) number already exists." });
        }
        console.error("PO Creation Error:", error);
        res.status(500).json({ message: "Server Error creating Purchase Order." });
    }
};
// ==========================================
// TASK 7: GST INVOICE GENERATION
// ==========================================
const generateGSTInvoice = async (req, res) => {
    try {
        const { purchase_order_id, buyer_gstin, gst_rate } = req.body;

        if (!purchase_order_id) {
            return res.status(400).json({ message: "purchase_order_id is required." });
        }

        // 1. Fetch Purchase Order details
        const poRes = await pool.query("SELECT * FROM purchase_orders WHERE id = $1", [purchase_order_id]);
        if (poRes.rows.length === 0) {
            return res.status(404).json({ message: "Purchase Order not found." });
        }

        const po = poRes.rows[0];
        const subtotal = parseFloat(po.total_amount);
        const taxRate = gst_rate !== undefined ? parseFloat(gst_rate) : 18.00; // Default 18% GST

        // Calculate GST and Grand Total
        const gstAmount = (subtotal * taxRate) / 100;
        const grandTotal = subtotal + gstAmount;

        // Generate unique Invoice Number
        const invoiceNumber = `INV-GST-${Date.now().toString().slice(-6)}-${po.id}`;

        // 2. Insert GST Invoice record
        const invoiceRes = await pool.query(
            `INSERT INTO gst_invoices 
             (invoice_number, purchase_order_id, company_name, buyer_gstin, subtotal, gst_rate, gst_amount, grand_total)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *;`,
            [
                invoiceNumber,
                purchase_order_id,
                po.company_name,
                buyer_gstin || 'UNREGISTERED-B2B',
                subtotal.toFixed(2),
                taxRate.toFixed(2),
                gstAmount.toFixed(2),
                grandTotal.toFixed(2)
            ]
        );

        // 3. Mark Purchase Order status as confirmed/invoiced
        await pool.query("UPDATE purchase_orders SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [purchase_order_id]);

        res.status(201).json({
            message: "Tax/GST Invoice generated successfully.",
            invoice: invoiceRes.rows[0]
        });

    } catch (error) {
        console.error("GST Invoice Generation Error:", error);
        res.status(500).json({ message: "Server Error generating GST invoice." });
    }
};

// Get GST Invoice By ID
const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM gst_invoices WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "GST Invoice not found." });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error("Get Invoice Error:", error);
        res.status(500).json({ message: "Server Error fetching GST invoice." });
    }
};
module.exports = {
    validateMOQ,
    calculateBulkOrder,
    createB2BRequest,
    getAllB2BRequests,
    getB2BRequestById,
    updateB2BStatus,
    submitRFQ,
    generateQuotation,
    respondToQuotation,
    createPurchaseOrder,
    generateGSTInvoice,
    getInvoiceById
};