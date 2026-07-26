const pool = require("../config/db");

// Add product to cart
const addToCart = async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;

        // Check if product already exists in cart
        const existing = await pool.query(
            `SELECT * FROM cart
             WHERE user_id = $1 AND product_id = $2`,
            [user_id, product_id]
        );

        if (existing.rows.length > 0) {
            const updated = await pool.query(
                `UPDATE cart
                 SET quantity = quantity + $1
                 WHERE user_id = $2
                 AND product_id = $3
                 RETURNING *`,
                [quantity, user_id, product_id]
            );

            return res.status(200).json({
                message: "Cart updated successfully",
                cart: updated.rows[0]
            });
        }

        const result = await pool.query(
            `INSERT INTO cart
            (user_id, product_id, quantity)
            VALUES ($1, $2, $3)
            RETURNING *`,
            [user_id, product_id, quantity]
        );

        res.status(201).json({
            message: "Product added to cart",
            cart: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// View cart
const getCart = async (req, res) => {
    try {

        const { user_id } = req.params;

        const result = await pool.query(
            `SELECT
                cart.id,
                cart.quantity,
                products.name,
                products.price,
                products.image_url
            FROM cart
            JOIN products
                ON cart.product_id = products.id
            WHERE cart.user_id = $1`,
            [user_id]
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
    addToCart,
    getCart
};