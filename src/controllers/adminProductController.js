const pool = require("../config/db"); // <-- adjust path to your existing pg Pool

// GET /api/admin/products/pending
async function getPendingProducts(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.id, p.name, p.price, p.vendor_id, v.business_name AS vendor_name, p.created_at
       FROM products p
       LEFT JOIN vendors v ON v.id = p.vendor_id
       WHERE p.approval_status = 'pending'
       ORDER BY p.created_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products WHERE approval_status = 'pending'`
    );

    res.json({
      success: true,
      products: result.rows,
      totalCount: parseInt(countResult.rows[0].count, 10),
      page: parseInt(page, 10),
    });
  } catch (err) {
    console.error("getPendingProducts error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch pending products" });
  }
}

// PATCH /api/admin/products/:id/approve
async function approveProduct(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const result = await pool.query(
      `UPDATE products
       SET approval_status = 'approved', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = NULL
       WHERE id = $2
       RETURNING id, name, approval_status`,
      [adminId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product approved", product: result.rows[0] });
  } catch (err) {
    console.error("approveProduct error:", err);
    res.status(500).json({ success: false, message: "Failed to approve product" });
  }
}

// PATCH /api/admin/products/:id/reject
async function rejectProduct(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    const result = await pool.query(
      `UPDATE products
       SET approval_status = 'rejected', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = $2
       WHERE id = $3
       RETURNING id, name, approval_status`,
      [adminId, reason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product rejected", product: result.rows[0] });
  } catch (err) {
    console.error("rejectProduct error:", err);
    res.status(500).json({ success: false, message: "Failed to reject product" });
  }
}

module.exports = { getPendingProducts, approveProduct, rejectProduct };