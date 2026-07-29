const pool = require('../config/db');

// 1. GET SALES SUMMARY FOR LOGGED-IN VENDOR
const getSalesSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch vendor ID
        const vendorResult = await pool.query(
            "SELECT id FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }

        const vendorId = vendorResult.rows[0].id;

        // Aggregate total sales stats for this vendor
        const summaryQuery = `
            SELECT 
                COALESCE(SUM(oi.quantity), 0) AS total_units_sold,
                COALESCE(SUM(oi.price * oi.quantity), 0.00) AS total_sales_revenue,
                COUNT(DISTINCT o.id) AS total_orders
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.vendor_id = $1 AND o.status != 'cancelled';
        `;

        const summary = await pool.query(summaryQuery, [vendorId]);

        res.status(200).json({
            success: true,
            summary: summary.rows[0]
        });

    } catch (error) {
        console.error("Error fetching sales summary:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. GET DETAILED SALES HISTORY (WITH OPTIONAL FILTERS)
const getSalesHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, startDate, endDate } = req.query;

        // Fetch vendor ID
        const vendorResult = await pool.query(
            "SELECT id FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }

        const vendorId = vendorResult.rows[0].id;

        let queryParams = [vendorId];
        let queryConditions = ["o.vendor_id = $1"];

        if (status) {
            queryParams.push(status);
            queryConditions.push(`o.status = $${queryParams.length}`);
        }

        if (startDate) {
            queryParams.push(startDate);
            queryConditions.push(`o.created_at >= $${queryParams.length}`);
        }

        if (endDate) {
            queryParams.push(endDate);
            queryConditions.push(`o.created_at <= $${queryParams.length}`);
        }

        const salesQuery = `
            SELECT 
                oi.id AS sale_item_id,
                o.id AS order_id,
                o.created_at AS order_date,
                o.status AS order_status,
                o.payment_method,
                p.id AS product_id,
                p.name AS product_name,
                oi.quantity,
                oi.price AS unit_price,
                (oi.quantity * oi.price) AS total_price,
                CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
                u.email AS customer_email
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN users u ON o.user_id = u.id
            WHERE ${queryConditions.join(" AND ")}
            ORDER BY o.created_at DESC;
        `;

        const sales = await pool.query(salesQuery, queryParams);

        res.status(200).json({
            success: true,
            count: sales.rows.length,
            sales: sales.rows
        });

    } catch (error) {
        console.error("Error fetching sales history:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. GET TOP-SELLING PRODUCTS FOR VENDOR
const getTopSellingProducts = async (req, res) => {
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

        const topProductsQuery = `
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                p.stock AS current_stock,
                SUM(oi.quantity) AS total_units_sold,
                SUM(oi.quantity * oi.price) AS total_revenue_generated
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.vendor_id = $1 AND o.status != 'cancelled'
            GROUP BY p.id, p.name, p.stock
            ORDER BY total_units_sold DESC
            LIMIT 5;
        `;

        const topProducts = await pool.query(topProductsQuery, [vendorId]);

        res.status(200).json({
            success: true,
            top_products: topProducts.rows
        });

    } catch (error) {
        console.error("Error fetching top selling products:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getSalesSummary,
    getSalesHistory,
    getTopSellingProducts
};