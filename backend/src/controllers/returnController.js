const pool = require("../config/db");

const getUserId = (req) => req.user?.id || req.user?.user_id || req.user?.userId;

// 1. Request Return
const requestReturn = async (req, res) => {
    try {
        const user_id = getUserId(req);
        const { order_id, reason, details } = req.body;

        if (!user_id) {
            return res.status(401).json({ message: "Unauthorized: User ID not found in token." });
        }

        if (!order_id || !reason) {
            return res.status(400).json({ message: "order_id and reason are required." });
        }

        // Check if the order exists, belongs to the user, and is 'delivered'
        const orderCheck = await pool.query(
            `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
            [order_id, user_id]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(404).json({ message: "Order not found or unauthorized." });
        }

        const order = orderCheck.rows[0];

        if (order.status !== 'delivered') {
            return res.status(400).json({ 
                message: `Cannot request a return for an order with status '${order.status}'. It must be 'delivered'.` 
            });
        }

        // Insert into returns table (Make sure your 'returns' table exists in Postgres)
        const returnResult = await pool.query(
            `INSERT INTO returns (order_id, user_id, reason, details, status)
             VALUES ($1, $2, $3, $4, 'pending')
             RETURNING *`,
            [order_id, user_id, reason, details]
        );

        // Optional: update order status to 'return_requested'
        await pool.query(
            `UPDATE orders SET status = 'return_requested' WHERE id = $1`,
            [order_id]
        );

        res.status(201).json({
            message: "Return request submitted successfully",
            return_request: returnResult.rows[0]
        });

    } catch (error) {
        console.error("Error in requestReturn:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    requestReturn
};