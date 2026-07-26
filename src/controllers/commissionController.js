const pool = require("../config/db");

// Create Commission
const createCommission = async (req, res) => {
    try {

        const {
            vendor_id,
            order_id,
            commission_rate,
            commission_amount,
            vendor_earning
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO commissions
            (
                vendor_id,
                order_id,
                commission_rate,
                commission_amount,
                vendor_earning
            )
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *;
            `,
            [
                vendor_id,
                order_id,
                commission_rate,
                commission_amount,
                vendor_earning
            ]
        );

        res.status(201).json({
            message: "Commission created successfully",
            commission: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Invalid Vendor ID or Order ID."
            });
        }

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get All Commissions
const getCommissions = async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT * FROM commissions ORDER BY id ASC"
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get Commission By ID
const getCommissionById = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM commissions WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Commission not found"
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

module.exports = {
    createCommission,
    getCommissions,
    getCommissionById
};