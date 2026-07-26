const pool = require("../config/db");

// Make Payment
const makePayment = async (req, res) => {
    try {

        const {
            user_id,
            order_id,
            amount,
            payment_method
        } = req.body;

        // Generate a unique transaction ID
        const transaction_id = "TXN" + Date.now();

        const result = await pool.query(
            `INSERT INTO payments
            (
                user_id,
                order_id,
                amount,
                payment_method,
                transaction_id
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                user_id,
                order_id,
                amount,
                payment_method,
                transaction_id
            ]
        );

        res.status(201).json({
            message: "Payment Successful",
            payment: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Payment History
const getPaymentHistory = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                payments.id,
                payments.amount,
                payments.payment_method,
                payments.status,
                payments.transaction_id,
                payments.created_at,
                users.first_name,
                users.last_name
            FROM payments
            JOIN users
                ON payments.user_id = users.id
            ORDER BY payments.created_at DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

module.exports = {
    makePayment,
    getPaymentHistory
};