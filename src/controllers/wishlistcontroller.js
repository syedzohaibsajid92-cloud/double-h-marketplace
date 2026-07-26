const pool = require("../config/db");

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        const result = await pool.query(
            `INSERT INTO wishlist (user_id, product_id)
             VALUES ($1, $2)
             RETURNING *`,
            [user_id, product_id]
        );

        res.status(201).json({
            message: "Product added to wishlist",
            wishlist: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get wishlist by user
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT
                wishlist.id,
                products.name,
                products.price,
                products.image_url
            FROM wishlist
            JOIN products
                ON wishlist.product_id = products.id
            WHERE wishlist.user_id = $1`,
            [userId]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM wishlist
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Wishlist item not found"
            });
        }

        res.status(200).json({
            message: "Item removed from wishlist"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist
};