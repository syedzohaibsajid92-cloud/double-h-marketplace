const pool = require("../config/db");

async function getCoupons(req, res) {
  try {
    const result = await pool.query(`SELECT * FROM coupons ORDER BY created_at DESC`);
    res.json({ success: true, coupons: result.rows });
  } catch (err) {
    console.error("getCoupons error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch coupons" });
  }
}

async function createCoupon(req, res) {
  try {
    const { code, discount_type, discount_value, min_order_amount, valid_from, valid_until, usage_limit } = req.body;
    const adminId = req.user.id;

    if (!code || !discount_type || !discount_value || !valid_from || !valid_until) {
      return res.status(400).json({ success: false, message: "Missing required coupon fields" });
    }

    const result = await pool.query(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, valid_from, valid_until, usage_limit, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [code, discount_type, discount_value, min_order_amount || 0, valid_from, valid_until, usage_limit || null, adminId]
    );

    res.status(201).json({ success: true, coupon: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ success: false, message: "Coupon code already exists" });
    }
    console.error("createCoupon error:", err);
    res.status(500).json({ success: false, message: "Failed to create coupon" });
  }
}

async function updateCoupon(req, res) {
  try {
    const { id } = req.params;
    const {
      discount_type = null,
      discount_value = null,
      min_order_amount = null,
      valid_from = null,
      valid_until = null,
      usage_limit = null,
      status = null
    } = req.body;

    const result = await pool.query(
      `UPDATE coupons SET
        discount_type = COALESCE($1::text, discount_type),
        discount_value = COALESCE($2::numeric, discount_value),
        min_order_amount = COALESCE($3::numeric, min_order_amount),
        valid_from = COALESCE($4::timestamptz, valid_from),
        valid_until = COALESCE($5::timestamptz, valid_until),
        usage_limit = COALESCE($6::integer, usage_limit),
        status = COALESCE($7::text, status),
        updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [discount_type, discount_value, min_order_amount, valid_from, valid_until, usage_limit, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, coupon: result.rows[0] });
  } catch (err) {
    console.error("updateCoupon error:", err);
    res.status(500).json({ success: false, message: "Failed to update coupon" });
  }
}

async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM coupons WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    console.error("deleteCoupon error:", err);
    res.status(500).json({ success: false, message: "Failed to delete coupon" });
  }
}

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon };
