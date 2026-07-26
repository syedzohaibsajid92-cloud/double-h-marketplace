const pool = require("../config/db");

const placeOrder = async (req, res) => {
    try {

        const { user_id } = req.body;

        // Get all cart items
        const cartItems = await pool.query(
            `SELECT
                cart.product_id,
                cart.quantity,
                products.price
            FROM cart
            JOIN products
                ON cart.product_id = products.id
            WHERE cart.user_id = $1`,
            [user_id]
        );

        if (cartItems.rows.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // Calculate total amount
        let totalAmount = 0;

        cartItems.rows.forEach(item => {
            totalAmount += item.price * item.quantity;
        });

        // Create order
        const orderResult = await pool.query(
            `INSERT INTO orders
            (user_id, total_amount)
            VALUES ($1, $2)
            RETURNING *`,
            [user_id, totalAmount]
        );

        const orderId = orderResult.rows[0].id;

        // Insert order items
        for (const item of cartItems.rows) {

            await pool.query(
                `INSERT INTO order_items
                (order_id, product_id, quantity, price)
                VALUES ($1, $2, $3, $4)`,
                [
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );

        }

        // Clear user's cart
        await pool.query(
            `DELETE FROM cart
             WHERE user_id = $1`,
            [user_id]
        );

        res.status(201).json({
            message: "Order placed successfully",
            order: orderResult.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get User Orders
const getUserOrders = async (req, res) => {
    try {

        const { userId } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM orders
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No orders found for this user"
            });
        }

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get Order By ID
const getOrderById = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM orders
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found"
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

// Cancel Order
const cancelOrder = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `UPDATE orders
             SET status = 'Cancelled'
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order cancelled successfully",
            order: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
// Get All Orders
const getAllOrders = async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT * FROM orders ORDER BY id ASC"
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
module.exports = {
    placeOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders
};