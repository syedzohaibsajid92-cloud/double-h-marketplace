const pool = require("../config/db");

// 1. Update/Adjust Product Stock (Restock or Manual Adjustment)
const adjustStock = async (req, res) => {
    const client = await pool.connect();
    try {
        const { product_id, quantity_change, change_type, note } = req.body;

        if (!product_id || quantity_change === undefined || !change_type) {
            return res.status(400).json({ 
                message: "product_id, quantity_change, and change_type are required." 
            });
        }

        await client.query('BEGIN'); // Start transaction

        // Fetch current product stock
        const productRes = await client.query(
            "SELECT stock_quantity FROM products WHERE id = $1 FOR UPDATE",
            [product_id]
        );

        if (productRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Product not found" });
        }

        const currentStock = productRes.rows[0].stock_quantity;
        const newStock = currentStock + parseInt(quantity_change, 10);

        if (newStock < 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: "Insufficient stock available" });
        }

        // Update product stock quantity
        await client.query(
            "UPDATE products SET stock_quantity = $1 WHERE id = $2",
            [newStock, product_id]
        );

        // Record stock log entry for audit history
        const logRes = await client.query(
            `INSERT INTO stock_logs 
                (product_id, change_type, quantity_change, previous_quantity, new_quantity, note)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [product_id, change_type.toUpperCase(), quantity_change, currentStock, newStock, note || null]
        );

        await client.query('COMMIT'); // Complete transaction

        res.status(200).json({
            success: true,
            message: "Stock updated successfully",
            stock_quantity: newStock,
            log: logRes.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    } finally {
        client.release();
    }
};

// 2. Get Low Stock Products (For Admin Dashboard Alerts)
const getLowStockProducts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, sku, stock_quantity, low_stock_threshold 
             FROM products 
             WHERE stock_quantity <= low_stock_threshold
             ORDER BY stock_quantity ASC`
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            products: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. Get Stock Audit History for a Specific Product
const getStockLogs = async (req, res) => {
    try {
        const { productId } = req.params;

        const result = await pool.query(
            `SELECT * FROM stock_logs 
             WHERE product_id = $1 
             ORDER BY created_at DESC`,
            [productId]
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            logs: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    adjustStock,
    getLowStockProducts,
    getStockLogs
};