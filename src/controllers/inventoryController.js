const pool = require("../config/db");

// 1. Get Vendor's Inventory List (with stock filter/status)
const getVendorInventory = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch vendor ID
        const vendorResult = await pool.query(
            "SELECT id FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }

        const vendorId = vendorResult.rows[0].id;

        // Get all products owned by this vendor with stock status
        const inventory = await pool.query(
            `SELECT 
                id, 
                name, 
                sku, 
                price, 
                stock, 
                CASE 
                    WHEN stock = 0 THEN 'Out of Stock'
                    WHEN stock <= 5 THEN 'Low Stock'
                    ELSE 'In Stock'
                END AS stock_status,
                updated_at
             FROM products 
             WHERE vendor_id = $1 
             ORDER BY stock ASC`,
            [vendorId]
        );

        res.status(200).json({
            count: inventory.rows.length,
            inventory: inventory.rows
        });

    } catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Update Stock Quantity & Log Movement in `inventory` Table
const updateProductStock = async (req, res) => {
    const client = await pool.connect(); // Transaction setup
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { stock, note } = req.body; // Allow an optional note for the change

        if (stock === undefined || stock < 0) {
            return res.status(400).json({ message: "Please provide a valid non-negative stock quantity." });
        }

        await client.query("BEGIN");

        // Verify vendor
        const vendorResult = await client.query(
            "SELECT id FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(403).json({ message: "Vendor account not found." });
        }

        const vendorId = vendorResult.rows[0].id;

        // Fetch existing product for previous stock check
        const productCheck = await client.query(
            "SELECT stock FROM products WHERE id = $1 AND vendor_id = $2 FOR UPDATE",
            [productId, vendorId]
        );

        if (productCheck.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Product not found or unauthorized." });
        }

        const previousStock = productCheck.rows[0].stock || 0;
        const quantityChange = stock - previousStock;

        // 1. Update product stock
        const updatedProduct = await client.query(
            `UPDATE products 
             SET stock = $1, updated_at = NOW() 
             WHERE id = $2 AND vendor_id = $3 
             RETURNING id, name, stock, price, updated_at`,
            [stock, productId, vendorId]
        );

        // 2. Log stock movement into inventory table
        const changeType = quantityChange >= 0 ? "restock" : "adjustment";

        await client.query(
            `INSERT INTO inventory 
                (product_id, vendor_id, change_type, quantity_change, previous_stock, new_stock, note, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                productId,
                vendorId,
                changeType,
                quantityChange,
                previousStock,
                stock,
                note || "Manual stock update",
                userId
            ]
        );

        await client.query("COMMIT");

        res.status(200).json({
            message: "Stock updated and inventory logged successfully.",
            product: updatedProduct.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error updating stock:", error);
        res.status(500).json({ message: "Server Error" });
    } finally {
        client.release();
    }
};

// 3. Get Stock Logs / Movement History for a Product
const getStockLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const logs = await pool.query(
            `SELECT 
                i.id,
                i.change_type,
                i.quantity_change,
                i.previous_stock,
                i.new_stock,
                i.note,
                i.created_at,
                CONCAT(u.first_name, ' ', u.last_name)
             FROM inventory i
             LEFT JOIN users u ON i.created_by = u.id
             INNER JOIN vendors v ON i.vendor_id = v.id
             WHERE i.product_id = $1 AND v.user_id = $2
             ORDER BY i.created_at DESC`,
            [productId, userId]
        );

        res.status(200).json({
            count: logs.rows.length,
            logs: logs.rows
        });
    } catch (error) {
        console.error("Error fetching stock logs:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getVendorInventory,
    updateProductStock,
    getStockLogs
};