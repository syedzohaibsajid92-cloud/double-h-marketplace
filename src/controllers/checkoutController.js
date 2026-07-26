const pool = require("../config/db");

// Process Checkout Summary
const getCheckoutSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch Cart Items with Product Details & Current Stock
        const cartItems = await pool.query(
            `SELECT 
                c.id AS cart_id,
                c.quantity,
                p.id AS product_id,
                p.name,
                p.price,
                p.stock,
                (p.price * c.quantity) AS subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = $1`,
            [userId]
        );

        if (cartItems.rows.length === 0) {
            return res.status(400).json({ message: "Your cart is empty." });
        }

        // 2. Stock Check: Verify all items have enough inventory
        const outOfStockItems = cartItems.rows.filter(item => item.quantity > item.stock);
        if (outOfStockItems.length > 0) {
            return res.status(400).json({
                message: "Some items in your cart exceed available stock.",
                out_of_stock: outOfStockItems.map(item => ({
                    product_id: item.product_id,
                    name: item.name,
                    requested: item.quantity,
                    available: item.stock
                }))
            });
        }

        // 3. Fetch User's Saved Addresses
        const addresses = await pool.query(
            `SELECT * FROM addresses WHERE user_id = $1`,
            [userId]
        );

        // 4. Calculations
        const subtotal = cartItems.rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        const shippingFee = subtotal > 5000 ? 0 : 250; // Standard shipping logic (e.g., free over 5000)
        const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% estimated tax
        const totalAmount = parseFloat((subtotal + shippingFee + tax).toFixed(2));

        res.status(200).json({
            summary: {
                cart_items: cartItems.rows,
                shipping_addresses: addresses.rows,
                bill_breakdown: {
                    subtotal,
                    shipping_fee: shippingFee,
                    tax,
                    total_amount: totalAmount
                }
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error during checkout summary" });
    }
};

module.exports = {
    getCheckoutSummary
};