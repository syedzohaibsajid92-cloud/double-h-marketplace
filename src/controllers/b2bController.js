const pool = require("../config/db");

// Create B2B Request
const createB2BRequest = async (req, res) => {
    try {

        const {
            user_id,
            company_name,
            contact_person,
            business_email,
            business_phone,
            request_details
        } = req.body;

        const result = await pool.query(
            `INSERT INTO b2b_requests
            (
                user_id,
                company_name,
                contact_person,
                business_email,
                business_phone,
                request_details
            )
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *`,
            [
                user_id,
                company_name,
                contact_person,
                business_email,
                business_phone,
                request_details
            ]
        );

        res.status(201).json({
            message: "B2B request submitted successfully",
            request: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Invalid User ID"
            });
        }

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get All B2B Requests
const getAllB2BRequests = async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT * FROM b2b_requests ORDER BY id ASC"
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get B2B Request By ID
const getB2BRequestById = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM b2b_requests WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "B2B request not found"
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

// Update B2B Request Status
const updateB2BStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            `UPDATE b2b_requests
             SET status = $1
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "B2B request not found"
            });
        }

        res.status(200).json({
            message: "Status updated successfully",
            request: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

module.exports = {
    createB2BRequest,
    getAllB2BRequests,
    getB2BRequestById,
    updateB2BStatus
};