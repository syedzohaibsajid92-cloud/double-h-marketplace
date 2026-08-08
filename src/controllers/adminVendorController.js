const pool = require("../config/db");

// GET /api/admin/vendors/pending
const getPendingVendors = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

      const result = await pool.query(
    `SELECT
        v.id, v.business_name, v.business_email, v.business_phone,
        v.business_address, v.city, v.status,
        u.first_name, u.last_name, u.email AS user_email
     FROM vendors v
     JOIN users u ON v.user_id = u.id
     WHERE v.status = 'pending'
     ORDER BY v.id ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
);

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM vendors WHERE status = 'pending'`
        );

        res.status(200).json({
            vendors: result.rows,
            totalCount: parseInt(countResult.rows[0].count, 10),
            page: parseInt(page, 10),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// PATCH /api/admin/vendors/:id/approve
const approveVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const result = await pool.query(
            `UPDATE vendors
             SET status = 'approved', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = NULL
             WHERE id = $2
             RETURNING id, business_name, status`,
            [adminId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({ message: "Vendor approved", vendor: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// PATCH /api/admin/vendors/:id/reject
const rejectVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        if (!reason) {
            return res.status(400).json({ message: "Rejection reason is required" });
        }

        const result = await pool.query(
            `UPDATE vendors
             SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = $2
             WHERE id = $3
             RETURNING id, business_name, status`,
            [adminId, reason, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({ message: "Vendor rejected", vendor: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getPendingVendors, approveVendor, rejectVendor };