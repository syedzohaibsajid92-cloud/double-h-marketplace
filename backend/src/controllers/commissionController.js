const pool = require("../config/db");

// 1. AUTOMATIC COMMISSION CALCULATION ENGINE
// Can be called automatically when an order is completed or via endpoint
const calculateOrderCommission = async (req, res) => {
    try {
        const { order_id, commission_rate = 10.00, vendor_id: reqVendorId } = req.body;

        if (!order_id) {
            return res.status(400).json({ message: "order_id is required." });
        }

        // 1. Fetch total_amount from order
        const orderRes = await pool.query("SELECT total_amount FROM orders WHERE id = $1", [order_id]);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ message: "Order not found." });
        }
        const total_amount = parseFloat(orderRes.rows[0].total_amount);

        // 2. Determine vendor_id: body override -> query DB -> fallback to 1
        let vendor_id = reqVendorId;

        if (!vendor_id) {
            const vendorRes = await pool.query(`
                SELECT p.vendor_id 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = $1 AND p.vendor_id IS NOT NULL
                LIMIT 1;
            `, [order_id]);

            vendor_id = vendorRes.rows.length > 0 ? vendorRes.rows[0].vendor_id : 1; // Default fallback ID
        }

        // 3. Engine Math
        const rate = parseFloat(commission_rate);
        const commission_amount = ((total_amount * rate) / 100).toFixed(2);
        const vendor_earning = (total_amount - parseFloat(commission_amount)).toFixed(2);

        // 4. Insert into DB
        const result = await pool.query(
            `
            INSERT INTO commissions (vendor_id, order_id, commission_rate, commission_amount, vendor_earning)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
            `,
            [vendor_id, order_id, rate, commission_amount, vendor_earning]
        );

        res.status(201).json({
            message: "Commission calculated and recorded successfully",
            commission: result.rows[0]
        });

    } catch (error) {
        console.error("DETAILED COMMISSION ERROR:", error.message);
        res.status(500).json({ 
            message: "Server Error calculating commission.",
            error_details: error.message 
        });
    }
};

// 2. MANUAL CREATE COMMISSION (Your original endpoint)
const createCommission = async (req, res) => {
    try {
        const { vendor_id, order_id, commission_rate, commission_amount, vendor_earning } = req.body;

        const result = await pool.query(
            `
            INSERT INTO commissions (vendor_id, order_id, commission_rate, commission_amount, vendor_earning)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
            `,
            [vendor_id, order_id, commission_rate, commission_amount, vendor_earning]
        );

        res.status(201).json({
            message: "Commission created successfully",
            commission: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        if (error.code === "23503") {
            return res.status(400).json({ message: "Invalid Vendor ID or Order ID." });
        }
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. GET ALL COMMISSIONS
const getCommissions = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM commissions ORDER BY id ASC");
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. GET COMMISSION BY ID
const getCommissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM commissions WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Commission not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
// 5. GET VENDOR EARNINGS LEDGER SUMMARY & HISTORY
const getVendorLedger = async (req, res) => {
    try {
        const { vendor_id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role?.toLowerCase() === "admin";

        if (!isAdmin) {
            // Confirm the requesting user actually owns this vendor_id
            const ownerCheck = await pool.query("SELECT id FROM vendors WHERE id = $1 AND user_id = $2", [vendor_id, userId]);
            if (ownerCheck.rows.length === 0) {
                return res.status(403).json({ message: "You can only view your own vendor ledger." });
            }
        }

        const summaryQuery = `
            SELECT 
                COALESCE(SUM(commission_amount + vendor_earning), 0) AS total_gross_sales,
                COALESCE(SUM(commission_amount), 0) AS total_platform_commission,
                COALESCE(SUM(vendor_earning), 0) AS total_net_earnings,
                COUNT(id) AS total_orders_processed
            FROM commissions
            WHERE vendor_id = $1;
        `;
        const summaryResult = await pool.query(summaryQuery, [vendor_id]);

        const historyQuery = `
            SELECT id, order_id, commission_rate, commission_amount, vendor_earning, created_at
            FROM commissions
            WHERE vendor_id = $1
            ORDER BY created_at DESC;
        `;
        const historyResult = await pool.query(historyQuery, [vendor_id]);

        res.status(200).json({
            success: true,
            summary: summaryResult.rows[0],
            ledger_history: historyResult.rows
        });

    } catch (error) {
        console.error("Ledger Error:", error.message);
        res.status(500).json({ message: "Server Error fetching vendor ledger." });
    }
};
// 6. SUBMIT WITHDRAWAL REQUEST (VENDOR)
const requestWithdrawal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, payout_method, account_details } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "amount is required." });
        }

        // Derive vendor_id from the logged-in user — never trust it from the request body
        const vendorRes = await pool.query("SELECT id FROM vendors WHERE user_id = $1", [userId]);
        if (vendorRes.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }
        const vendor_id = vendorRes.rows[0].id;

        const requestedAmount = parseFloat(amount);

        const earningsRes = await pool.query(
            "SELECT COALESCE(SUM(vendor_earning), 0) AS total_earnings FROM commissions WHERE vendor_id = $1",
            [vendor_id]
        );
        const totalEarnings = parseFloat(earningsRes.rows[0].total_earnings);

        const withdrawalRes = await pool.query(
            "SELECT COALESCE(SUM(amount), 0) AS total_withdrawn FROM withdrawal_requests WHERE vendor_id = $1 AND status IN ('pending', 'approved')",
            [vendor_id]
        );
        const totalWithdrawn = parseFloat(withdrawalRes.rows[0].total_withdrawn);

        const availableBalance = totalEarnings - totalWithdrawn;

        if (requestedAmount > availableBalance) {
            return res.status(400).json({
                message: "Insufficient balance for withdrawal.",
                available_balance: availableBalance.toFixed(2),
                requested_amount: requestedAmount.toFixed(2)
            });
        }

        const newRequest = await pool.query(
            `INSERT INTO withdrawal_requests (vendor_id, amount, payout_method, account_details)
             VALUES ($1, $2, $3, $4)
             RETURNING *;`,
            [vendor_id, requestedAmount, payout_method || 'bank_transfer', account_details || '']
        );

        res.status(201).json({
            message: "Withdrawal request submitted successfully.",
            request: newRequest.rows[0]
        });

    } catch (error) {
        console.error("Withdrawal Error:", error.message);
        res.status(500).json({ message: "Server Error processing withdrawal request." });
    }
};

// 7. UPDATE WITHDRAWAL STATUS (ADMIN)
const updateWithdrawalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body; // status: 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Status must be 'approved' or 'rejected'." });
        }

        const updated = await pool.query(
            `UPDATE withdrawal_requests 
             SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 
             RETURNING *;`,
            [status, admin_notes || '', id]
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ message: "Withdrawal request not found." });
        }

        res.status(200).json({
            message: `Withdrawal request ${status} successfully.`,
            request: updated.rows[0]
        });

    } catch (error) {
        console.error("Update Withdrawal Error:", error.message);
        res.status(500).json({ message: "Server Error updating withdrawal request." });
    }
};
// 8. GET PLATFORM COMMISSION & PAYOUT REPORTS (ADMIN ANALYTICS)
const getCommissionReports = async (req, res) => {
    try {
        // Overall revenue and payout metrics
        const metricsQuery = `
            SELECT 
                COALESCE(SUM(c.commission_amount + c.vendor_earning), 0) AS total_marketplace_sales,
                COALESCE(SUM(c.commission_amount), 0) AS total_platform_commission_earned,
                COALESCE(SUM(c.vendor_earning), 0) AS total_vendor_earnings_generated,
                COALESCE((SELECT SUM(amount) FROM withdrawal_requests WHERE status = 'approved'), 0) AS total_payouts_completed,
                COALESCE((SELECT SUM(amount) FROM withdrawal_requests WHERE status = 'pending'), 0) AS total_payouts_pending
            FROM commissions c;
        `;
        const metricsResult = await pool.query(metricsQuery);

        // Fetch recent withdrawal requests across all vendors
        const payoutsQuery = `
            SELECT 
                w.id AS withdrawal_id,
                w.vendor_id,
                w.amount,
                w.status,
                w.payout_method,
                w.created_at
            FROM withdrawal_requests w
            ORDER BY w.created_at DESC;
        `;
        const payoutsResult = await pool.query(payoutsQuery);

        res.status(200).json({
            success: true,
            analytics: metricsResult.rows[0],
            recent_payout_requests: payoutsResult.rows
        });

    } catch (error) {
        console.error("Report Generation Error:", error.message);
        res.status(500).json({ message: "Server Error generating commission reports." });
    }
};
module.exports = {
    calculateOrderCommission,
    createCommission,
    getCommissions,
    getCommissionById,
    getVendorLedger,
    requestWithdrawal,
    updateWithdrawalStatus,
    getCommissionReports
};
