const pool = require('../config/db');

// Default platform commission rate (10%) if vendor record has NULL
const DEFAULT_COMMISSION_RATE = 10.0; 

// 1. GET OVERALL REVENUE SUMMARY & EARNINGS BREAKDOWN
const getRevenueSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch vendor info
        const vendorResult = await pool.query(
            "SELECT id, commission_rate, pending_payout, total_sales FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }

        const vendor = vendorResult.rows[0];
        const vendorId = vendor.id;
        
        // Use custom commission_rate or fallback to 10%
        const commissionRatePercent = vendor.commission_rate 
            ? parseFloat(vendor.commission_rate) 
            : DEFAULT_COMMISSION_RATE;

        const commissionRateDecimal = commissionRatePercent / 100;

        // Aggregate stats directly from non-cancelled orders
        const revenueQuery = `
            SELECT 
                COALESCE(SUM(oi.quantity * oi.price), 0.00) AS gross_revenue,
                COUNT(DISTINCT o.id) AS total_paid_orders,
                COALESCE(SUM(oi.quantity), 0) AS total_units_sold
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.vendor_id = $1 AND o.status != 'cancelled';
        `;

        const result = await pool.query(revenueQuery, [vendorId]);
        const grossRevenue = parseFloat(result.rows[0].gross_revenue);
        
        // Calculate Platform Cut & Vendor Net Earning
        const platformCommissionFee = parseFloat((grossRevenue * commissionRateDecimal).toFixed(2));
        const netVendorEarnings = parseFloat((grossRevenue - platformCommissionFee).toFixed(2));

        res.status(200).json({
            success: true,
            revenue: {
                gross_revenue: grossRevenue.toFixed(2),
                commission_rate: `${commissionRatePercent.toFixed(1)}%`,
                platform_commission_fee: platformCommissionFee.toFixed(2),
                net_vendor_earnings: netVendorEarnings.toFixed(2),
                pending_payout: parseFloat(vendor.pending_payout || 0.00).toFixed(2),
                total_paid_orders: parseInt(result.rows[0].total_paid_orders),
                total_units_sold: parseInt(result.rows[0].total_units_sold)
            }
        });

    } catch (error) {
        console.error("Error fetching revenue summary:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. GET MONTHLY REVENUE REPORT
const getMonthlyRevenueReport = async (req, res) => {
    try {
        const userId = req.user.id;

        const vendorResult = await pool.query(
            "SELECT id, commission_rate FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }

        const vendorId = vendorResult.rows[0].id;
        const commissionRatePercent = vendorResult.rows[0].commission_rate 
            ? parseFloat(vendorResult.rows[0].commission_rate) 
            : DEFAULT_COMMISSION_RATE;

        const commissionRateDecimal = commissionRatePercent / 100;

        const monthlyQuery = `
            SELECT 
                TO_CHAR(o.created_at, 'YYYY-MM') AS month,
                COALESCE(SUM(oi.quantity * oi.price), 0.00) AS gross_revenue,
                COUNT(DISTINCT o.id) AS total_orders
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.vendor_id = $1 AND o.status != 'cancelled'
            GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
            ORDER BY month DESC;
        `;

        const monthlyResult = await pool.query(monthlyQuery, [vendorId]);

        const monthlyReport = monthlyResult.rows.map(row => {
            const gross = parseFloat(row.gross_revenue);
            const fee = parseFloat((gross * commissionRateDecimal).toFixed(2));
            const net = parseFloat((gross - fee).toFixed(2));

            return {
                month: row.month,
                gross_revenue: gross.toFixed(2),
                platform_fee: fee.toFixed(2),
                net_earnings: net.toFixed(2),
                total_orders: parseInt(row.total_orders)
            };
        });

        res.status(200).json({
            success: true,
            monthly_report: monthlyReport
        });

    } catch (error) {
        console.error("Error fetching monthly revenue report:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getRevenueSummary,
    getMonthlyRevenueReport
};