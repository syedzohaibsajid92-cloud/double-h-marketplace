const pool = require("../config/db");

// ==========================================
// TASKS 1-6: CREATE DISPUTE / CLAIM WORKFLOW
// ==========================================
const createDispute = async (req, res) => {
    try {
        const {
            order_id,
            user_id,
            subject,
            description,
            dispute_type,  // 'refund' or 'replacement'
            claim_reason,  // 'wrong_item', 'damaged_product', 'missing_shipment', 'other'
            evidence_url   // optional photo/doc link (Task 6)
        } = req.body;

        const type = dispute_type || 'refund';
        const reason = claim_reason || 'other';

        const result = await pool.query(
            `INSERT INTO disputes
            (
                order_id,
                user_id,
                subject,
                description,
                dispute_type,
                claim_reason,
                evidence_url
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                order_id,
                user_id,
                subject,
                description,
                type,
                reason,
                evidence_url || null
            ]
        );

        res.status(201).json({
            message: "Dispute created successfully",
            dispute: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Invalid Order ID or User ID."
            });
        }

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// ==========================================
// TASK 7: ADMIN REVIEW & RESOLUTION WORKFLOW
// ==========================================
const resolveDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body; // status: 'approved', 'rejected', 'resolved'

        if (!status) {
            return res.status(400).json({ message: "Status is required." });
        }

        const result = await pool.query(
            `UPDATE disputes
             SET status = $1, admin_notes = $2
             WHERE id = $3
             RETURNING *`,
            [status, admin_notes || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Dispute not found"
            });
        }

        res.status(200).json({
            message: `Dispute ${status} successfully.`,
            dispute: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get All Disputes
const getDisputes = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM disputes ORDER BY id ASC"
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get Dispute By ID
const getDisputeById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM disputes WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Dispute not found"
            });
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Update Dispute Status (Generic)
const updateDisputeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            `UPDATE disputes
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Dispute not found"
            });
        }

        res.status(200).json({
            message: "Dispute status updated successfully",
            dispute: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    createDispute,
    resolveDispute,
    getDisputes,
    getDisputeById,
    updateDisputeStatus
};