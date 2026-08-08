const pool = require("../config/db");

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const user_id = req.user.id;
const { product_id } = req.body;
// Check if product exists
const product = await pool.query(
    "SELECT id FROM products WHERE id = $1",
    [product_id]
);

if (product.rows.length === 0) {
    return res.status(404).json({
        message: "Product not found."
    });
}

// Prevent duplicate wishlist items
const duplicate = await pool.query(
    `SELECT id
     FROM wishlist
     WHERE user_id = $1
     AND product_id = $2`,
    [user_id, product_id]
);

if (duplicate.rows.length > 0) {
    return res.status(409).json({
        message: "Product already exists in wishlist."
    });
}

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
        const userId = req.user.id;

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
        const userId = req.user.id;

     const result = await pool.query(
    `DELETE FROM wishlist
     WHERE id = $1
     AND user_id = $2
     RETURNING *`,
    [id, userId]
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