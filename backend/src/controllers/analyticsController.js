const pool = require('../config/db');

// GET COMPREHENSIVE VENDOR ANALYTICS
const getVendorAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get Vendor ID
        const vendorResult = await pool.query(
            "SELECT id FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }

        const vendorId = vendorResult.rows[0].id;

        // 2. Daily Sales Trend (Last 30 Days)
        const salesTrendQuery = `
            SELECT 
                TO_CHAR(o.created_at, 'YYYY-MM-DD') AS date,
                COALESCE(SUM(oi.quantity * oi.price), 0.00) AS revenue,
                COALESCE(SUM(oi.quantity), 0) AS units_sold
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.vendor_id = $1 
              AND o.status != 'cancelled'
              AND o.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY TO_CHAR(o.created_at, 'YYYY-MM-DD')
            ORDER BY date ASC;
        `;

        // 3. Order Status Breakdown
        const orderStatusQuery = `
            SELECT 
                status,
                COUNT(id) AS count
            FROM orders
            WHERE vendor_id = $1
            GROUP BY status;
        `;

        // 4. Inventory Health Metrics
        const inventoryHealthQuery = `
            SELECT 
                COUNT(id) AS total_products,
                COUNT(CASE WHEN stock = 0 THEN 1 END) AS out_of_stock_count,
                COUNT(CASE WHEN stock > 0 AND stock <= 5 THEN 1 END) AS low_stock_count
            FROM products
            WHERE vendor_id = $1;
        `;

        // 5. Average Order Value (AOV) & Total Financial Performance
        const kpiQuery = `
            SELECT 
                COALESCE(SUM(oi.quantity * oi.price), 0.00) AS total_revenue,
                COUNT(DISTINCT o.id) AS total_orders
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.vendor_id = $1 AND o.status != 'cancelled';
        `;

        // Execute all queries concurrently for maximum speed
        const [salesTrend, orderStatus, inventoryHealth, kpi] = await Promise.all([
            pool.query(salesTrendQuery, [vendorId]),
            pool.query(orderStatusQuery, [vendorId]),
            pool.query(inventoryHealthQuery, [vendorId]),
            pool.query(kpiQuery, [vendorId])
        ]);

        const totalRevenue = parseFloat(kpi.rows[0].total_revenue);
        const totalOrders = parseInt(kpi.rows[0].total_orders);
        const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";

        res.status(200).json({
            success: true,
            analytics: {
                kpis: {
                    total_revenue: totalRevenue.toFixed(2),
                    total_orders: totalOrders,
                    average_order_value: averageOrderValue
                },
                inventory_health: {
                    total_products: parseInt(inventoryHealth.rows[0].total_products),
                    out_of_stock: parseInt(inventoryHealth.rows[0].out_of_stock_count),
                    low_stock_warning: parseInt(inventoryHealth.rows[0].low_stock_count)
                },
                order_status_breakdown: orderStatus.rows.map(row => ({
                    status: row.status,
                    count: parseInt(row.count)
                })),
                sales_trend_30_days: salesTrend.rows.map(row => ({
                    date: row.date,
                    revenue: parseFloat(row.revenue).toFixed(2),
                    units_sold: parseInt(row.units_sold)
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching vendor analytics:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getVendorAnalytics
};