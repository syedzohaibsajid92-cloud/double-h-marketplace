const pool = require("../config/db");

// 1. Create a new discount rule
const createDiscount = async (req, res) => {
    try {
        const { 
            name, discount_type, discount_value, 
            start_date, end_date, product_id, category_id 
        } = req.body;

        if (!name || !discount_type || !discount_value || !start_date || !end_date) {
            return res.status(400).json({ message: "Missing required discount fields." });
        }

        const result = await pool.query(
            `INSERT INTO discounts 
             (name, discount_type, discount_value, start_date, end_date, product_id, category_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [name, discount_type, discount_value, start_date, end_date, product_id || null, category_id || null]
        );

        res.status(201).json({
            success: true,
            message: "Discount rule created successfully",
            discount: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Get all active discounts
const getActiveDiscounts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM discounts 
             WHERE is_active = TRUE 
             AND CURRENT_TIMESTAMP BETWEEN start_date AND end_date
             ORDER BY end_date ASC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            discounts: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. Calculate final price for a specific product
const calculatePrice = async (req, res) => {
    try {
        const { productId } = req.params;

        // Fetch product base price and category
        const productRes = await pool.query(
            "SELECT price, category_id FROM products WHERE id = $1",
            [productId]
        );

        if (productRes.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        const product = productRes.rows[0];
        let finalPrice = parseFloat(product.price);

        // Fetch applicable active discounts (targeting the specific product OR its category)
        const discountRes = await pool.query(
            `SELECT discount_type, discount_value FROM discounts 
             WHERE is_active = TRUE 
             AND CURRENT_TIMESTAMP BETWEEN start_date AND end_date
             AND (product_id = $1 OR category_id = $2)`,
            [productId, product.category_id]
        );

        let appliedDiscounts = [];

        // Apply rules (if multiple apply, you can stack them or take the biggest one. Here we stack them.)
        discountRes.rows.forEach(rule => {
            const value = parseFloat(rule.discount_value);
            appliedDiscounts.push(rule);

            if (rule.discount_type === 'PERCENTAGE') {
                finalPrice -= finalPrice * (value / 100);
            } else if (rule.discount_type === 'FIXED') {
                finalPrice -= value;
            }
        });

        // Ensure price doesn't drop below zero
        finalPrice = Math.max(0, finalPrice);

        res.status(200).json({
            success: true,
            base_price: parseFloat(product.price),
            final_price: finalPrice.toFixed(2),
            discounts_applied: appliedDiscounts.length,
            details: appliedDiscounts
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. Disable/Delete a discount rule
const disableDiscount = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "UPDATE discounts SET is_active = FALSE WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Discount not found" });
        }

        res.status(200).json({
            success: true,
            message: "Discount rule disabled successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createDiscount,
    getActiveDiscounts,
    calculatePrice,
    disableDiscount
};