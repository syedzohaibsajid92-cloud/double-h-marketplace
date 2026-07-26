const pool = require("../config/db");

// Create Dispute
const createDispute = async (req, res) => {
    try {

        const {
            order_id,
            user_id,
            subject,
            description
        } = req.body;

        const result = await pool.query(
            `INSERT INTO disputes
            (
                order_id,
                user_id,
                subject,
                description
            )
            VALUES ($1,$2,$3,$4)
            RETURNING *`,
            [
                order_id,
                user_id,
                subject,
                description
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

// Update Dispute Status
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
    getDisputes,
    getDisputeById,
    updateDisputeStatus
};