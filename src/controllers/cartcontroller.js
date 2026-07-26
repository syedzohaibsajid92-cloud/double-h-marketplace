const pool = require("../config/db");

// 1. ADD / UPDATE ITEM IN CART
const addToCart = async (req, res) => {
    try {
        const user_id = req.user.id; // Extracted securely from JWT
        const { product_id, quantity = 1 } = req.body;

        if (!product_id || quantity <= 0) {
            return res.status(400).json({ message: "Valid product_id and positive quantity are required." });
        }

        // Check if product exists and inspect available stock
        const productCheck = await pool.query(
            "SELECT id, stock FROM products WHERE id = $1",
            [product_id]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({ message: "Product not found." });
        }

        const availableStock = productCheck.rows[0].stock;

        // Check if product already exists in user's cart
        const existing = await pool.query(
            `SELECT * FROM cart WHERE user_id = $1 AND product_id = $2`,
            [user_id, product_id]
        );

        if (existing.rows.length > 0) {
            const newQuantity = existing.rows[0].quantity + quantity;

            if (newQuantity > availableStock) {
                return res.status(400).json({
                    message: `Cannot add more. Quantity exceeds available stock of ${availableStock}.`
                });
            }

            const updated = await pool.query(
                `UPDATE cart
                 SET quantity = $1
                 WHERE user_id = $2 AND product_id = $3
                 RETURNING *`,
                [newQuantity, user_id, product_id]
            );

            return res.status(200).json({
                message: "Cart updated successfully",
                cart: updated.rows[0]
            });
        }

        if (quantity > availableStock) {
            return res.status(400).json({
                message: `Requested quantity exceeds available stock of ${availableStock}.`
            });
        }

        // Insert new cart item
        const result = await pool.query(
            `INSERT INTO cart (user_id, product_id, quantity)
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
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. VIEW CART (Calculates Subtotals and Grand Total)
const getCart = async (req, res) => {
    try {
        const user_id = req.user.id; // Pull directly from JWT token

        const result = await pool.query(
            `SELECT
                cart.id AS cart_id,
                cart.quantity,
                products.id AS product_id,
                products.name,
                products.price,
                products.image_url,
                (products.price * cart.quantity) AS subtotal
            FROM cart
            JOIN products ON cart.product_id = products.id
            WHERE cart.user_id = $1`,
            [user_id]
        );

        const grandTotal = result.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        res.status(200).json({
            cart: result.rows,
            grand_total: grandTotal
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. UPDATE QUANTITY SPECIFICALLY
const updateCartQuantity = async (req, res) => {
    try {
        const { id } = req.params; // cart item ID
        const user_id = req.user.id;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: "Quantity must be greater than 0." });
        }

        // Verify ownership and stock limit
        const cartItem = await pool.query(
            `SELECT cart.id, cart.product_id, products.stock 
             FROM cart 
             JOIN products ON cart.product_id = products.id 
             WHERE cart.id = $1 AND cart.user_id = $2`,
            [id, user_id]
        );

        if (cartItem.rows.length === 0) {
            return res.status(404).json({ message: "Cart item not found." });
        }

        if (quantity > cartItem.rows[0].stock) {
            return res.status(400).json({
                message: `Quantity exceeds available stock of ${cartItem.rows[0].stock}.`
            });
        }

        const result = await pool.query(
            `UPDATE cart
             SET quantity = $1
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
            [quantity, id, user_id]
        );

        res.status(200).json({
            message: "Cart quantity updated",
            cart: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. REMOVE ITEM FROM CART
const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await pool.query(
            `DELETE FROM cart
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Cart item not found." });
        }

        res.status(200).json({ message: "Item removed from cart" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
};