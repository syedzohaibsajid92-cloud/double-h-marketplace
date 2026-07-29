const pool = require("../config/db");

const submitVerification = async (req, res) => {
    try {

        const userId = req.user.id;
        const { cnic_number, verification_document_url } = req.body;

        if (!cnic_number || !verification_document_url) {
            return res.status(400).json({
                message: "CNIC number and a verification document link are required."
            });
        }

        const vendorResult = await pool.query(
            "SELECT id, verification_status FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(404).json({
                message: "No vendor account found for this user. Register as a vendor first."
            });
        }

        const vendor = vendorResult.rows[0];

        if (vendor.verification_status === "verified") {
            return res.status(400).json({
                message: "Your vendor account is already verified."
            });
        }

        const result = await pool.query(
            `UPDATE vendors
             SET cnic_number = $1,
                 verification_document_url = $2,
                 verification_status = 'submitted',
                 verification_submitted_at = NOW(),
                 verification_rejection_reason = NULL
             WHERE id = $3
             RETURNING id, cnic_number, verification_document_url, verification_status, verification_submitted_at`,
            [cnic_number, verification_document_url, vendor.id]
        );

        res.status(200).json({
            message: "Verification documents submitted successfully. Waiting for admin review.",
            vendor: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getMyVerificationStatus = async (req, res) => {
    try {

        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, business_name, cnic_number, verification_document_url,
                    verification_status, verification_rejection_reason,
                    verification_submitted_at, verification_reviewed_at
             FROM vendors
             WHERE user_id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No vendor account found for this user."
            });
        }

        res.status(200).json({ vendor: result.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { submitVerification, getMyVerificationStatus };