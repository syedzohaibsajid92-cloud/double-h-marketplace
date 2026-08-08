const pool = require("../config/db"); // <-- confirm this matches your actual path

// GET /api/admin/analytics/overview
async function getOverview(req, res) {
  try {
    const [vendors, products, revenue, activeUsers] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM vendors WHERE status = 'approved'`),
      pool.query(`SELECT COUNT(*) FROM products WHERE status = 'approved'`),
      pool.query(`
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM payments
        WHERE status = 'completed'
          AND created_at >= date_trunc('month', CURRENT_DATE)
      `),
      pool.query(`
        SELECT COUNT(DISTINCT user_id) FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
      `),
    ]);

    res.json({
      success: true,
      totalVendors: parseInt(vendors.rows[0].count, 10),
      totalProducts: parseInt(products.rows[0].count, 10),
      monthlyRevenue: parseFloat(revenue.rows[0].total),
      activeUsers: parseInt(activeUsers.rows[0].count, 10),
    });
  } catch (err) {
    console.error("getOverview error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch overview analytics" });
  }
}

// GET /api/admin/analytics/revenue-trends?range=6m
async function getRevenueTrends(req, res) {
  try {
    const { range = "6m" } = req.query;
    const months = parseInt(range.replace("m", ""), 10) || 6;

    const result = await pool.query(
      `SELECT to_char(date_trunc('month', created_at), 'Mon') AS month,
              COALESCE(SUM(amount), 0) AS revenue
       FROM payments
       WHERE status = 'completed'
         AND created_at >= NOW() - ($1 || ' months')::INTERVAL
       GROUP BY date_trunc('month', created_at)
       ORDER BY date_trunc('month', created_at) ASC`,
      [months]
    );

    res.json({
      success: true,
      data: result.rows.map(r => ({ month: r.month, revenue: parseFloat(r.revenue) })),
    });
  } catch (err) {
    console.error("getRevenueTrends error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch revenue trends" });
  }
}

module.exports = { getOverview, getRevenueTrends };