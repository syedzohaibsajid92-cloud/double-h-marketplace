const pool = require('../config/db');

// 1. SUBMIT A NEW PAYOUT REQUEST
const requestPayout = async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        const { amount, payment_method, bank_details, note } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Please provide a valid payout amount greater than 0." });
        }

        // Get Vendor info
        const vendorResult = await client.query(
            "SELECT id, commission_rate FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }

        const vendor = vendorResult.rows[0];
        const vendorId = vendor.id;
        const commissionRatePercent = vendor.commission_rate ? parseFloat(vendor.commission_rate) : 0.0;
        const commissionDecimal = commissionRatePercent / 100;

        await client.query('BEGIN');

        // Calculate total gross revenue from non-cancelled orders
        const revenueResult = await client.query(`
            SELECT COALESCE(SUM(oi.quantity * oi.price), 0.00) AS gross_revenue
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.vendor_id = $1 AND o.status != 'cancelled';
        `, [vendorId]);

        const grossRevenue = parseFloat(revenueResult.rows[0].gross_revenue);
        const netTotalEarnings = grossRevenue * (1 - commissionDecimal);

        // Calculate total amount already requested/paid out
        const existingPayoutsResult = await client.query(`
            SELECT COALESCE(SUM(amount), 0.00) AS total_requested
            FROM payouts
            WHERE vendor_id = $1 AND status IN ('pending', 'approved', 'completed');
        `, [vendorId]);

        const totalRequested = parseFloat(existingPayoutsResult.rows[0].total_requested);
        const availableBalance = netTotalEarnings - totalRequested;

        // Validation check for sufficient funds
        if (parseFloat(amount) > availableBalance) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                message: `Insufficient balance. Available balance: $${availableBalance.toFixed(2)}` 
            });
        }

        // Insert Payout Record
        const insertPayoutQuery = `
            INSERT INTO payouts (vendor_id, amount, payment_method, bank_details, note)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, vendor_id, amount, status, payment_method, bank_details, note, created_at;
        `;

        const payoutResult = await client.query(insertPayoutQuery, [
            vendorId,
            amount,
            payment_method || 'bank_transfer',
            bank_details ? JSON.stringify(bank_details) : null,
            note || null
        ]);

        // Update pending_payout in vendors table
        await client.query(`
            UPDATE vendors 
            SET pending_payout = COALESCE(pending_payout, 0) + $1
            WHERE id = $2;
        `, [amount, vendorId]);

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: "Payout request submitted successfully.",
            payout: payoutResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error creating payout request:", error);
        res.status(500).json({ message: "Server Error" });
    } finally {
        client.release();
    }
};

// 2. GET VENDOR PAYOUT HISTORY
const getPayoutHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const vendorResult = await pool.query(
            "SELECT id FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }

        const vendorId = vendorResult.rows[0].id;

        const payoutsQuery = `
            SELECT id, amount, status, payment_method, bank_details, note, created_at, processed_at
            FROM payouts
            WHERE vendor_id = $1
            ORDER BY created_at DESC;
        `;

        const payouts = await pool.query(payoutsQuery, [vendorId]);

        res.status(200).json({
            success: true,
            count: payouts.rows.length,
            payouts: payouts.rows
        });

    } catch (error) {
        console.error("Error fetching payout history:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    requestPayout,
    getPayoutHistory
};