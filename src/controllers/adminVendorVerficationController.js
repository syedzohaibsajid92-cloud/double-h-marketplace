const pool = require("../config/db");

const getPendingVerifications = async (req, res) => {
    try {

        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT v.id, v.business_name, v.cnic_number, v.verification_document_url,
                    v.verification_status, v.verification_submitted_at,
                    u.first_name, u.last_name, u.email
             FROM vendors v
             JOIN users u ON v.user_id = u.id
             WHERE v.verification_status = 'submitted'
             ORDER BY v.verification_submitted_at ASC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM vendors WHERE verification_status = 'submitted'`
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

const verifyVendor = async (req, res) => {
    try {

        const { id } = req.params;
        const adminId = req.user.id;

        const result = await pool.query(
            `UPDATE vendors
             SET verification_status = 'verified',
                 verification_reviewed_by = $1,
                 verification_reviewed_at = NOW(),
                 verification_rejection_reason = NULL
             WHERE id = $2
             RETURNING id, business_name, verification_status`,
            [adminId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({
            message: "Vendor verified successfully",
            vendor: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const rejectVendorVerification = async (req, res) => {
    try {

        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        if (!reason) {
            return res.status(400).json({ message: "Rejection reason is required" });
        }

        const result = await pool.query(
            `UPDATE vendors
             SET verification_status = 'rejected',
                 verification_reviewed_by = $1,
                 verification_reviewed_at = NOW(),
                 verification_rejection_reason = $2
             WHERE id = $3
             RETURNING id, business_name, verification_status`,
            [adminId, reason, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.status(200).json({
            message: "Vendor verification rejected",
            vendor: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getPendingVerifications, verifyVendor, rejectVendorVerification };