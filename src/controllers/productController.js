const pool = require("../config/db");

// 1. GET ALL PRODUCTS (Supports Search, Filtering, & Sorting in ONE place)
// 1. GET ALL PRODUCTS (Supports Search, Filtering, & Sorting)
const getProducts = async (req, res) => {
    try {
        const { category, brand, minPrice, maxPrice, search, sort, vendor_id } = req.query;

        let query = `
            SELECT 
                p.*,
                c.name AS category_name,
                v.business_name AS vendor_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN vendors v ON p.vendor_id = v.id
            WHERE 1=1
        `;

        const values = [];
        let index = 1;

        // Dynamic Filtering
        if (vendor_id) {
            query += ` AND p.vendor_id = $${index}`;
            values.push(vendor_id);
            index++;
        }

        if (category) {
            query += ` AND p.category_id = $${index}`;
            values.push(category);
            index++;
        }

        if (brand) {
            query += ` AND LOWER(p.brand) = LOWER($${index})`;
            values.push(brand);
            index++;
        }

        if (minPrice) {
            query += ` AND p.price >= $${index}`;
            values.push(minPrice);
            index++;
        }

        if (maxPrice) {
            query += ` AND p.price <= $${index}`;
            values.push(maxPrice);
            index++;
        }

        if (search) {
            query += ` AND (LOWER(p.name) LIKE LOWER($${index}) OR LOWER(p.description) LIKE LOWER($${index}))`;
            values.push(`%${search}%`);
            index++;
        }

        // Sorting
        if (sort === "price_asc") {
            query += ` ORDER BY p.price ASC`;
        } else if (sort === "price_desc") {
            query += ` ORDER BY p.price DESC`;
        } else if (sort === "newest") {
            query += ` ORDER BY p.created_at DESC`;
        } else {
            query += ` ORDER BY p.id ASC`;
        }

        const result = await pool.query(query, values);

        res.status(200).json({
            success: true,
            count: result.rows.length,
            products: result.rows
        });

    } catch (error) {
        console.error("Error in getProducts:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. GET SINGLE PRODUCT BY ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
                p.*,
                c.name AS category_name,
                v.business_name AS vendor_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN vendors v ON p.vendor_id = v.id
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({
            success: true,
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Error in getProductById:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. CREATE PRODUCT (Vendor Only)
const createProduct = async (req, res) => {
    try {
        const userId = req.user.id; // From authMiddleware

        // Check if user is a vendor
        const vendorResult = await pool.query(
            "SELECT id FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (vendorResult.rows.length === 0) {
            return res.status(403).json({
                message: "Forbidden: You must have a registered vendor account to create products."
            });
        }

        const vendorId = vendorResult.rows[0].id;

        const {
            name,
            description,
            brand,
            sku,
            price,
            stock,
            discount,
            category_id,
            image_url,
            specifications
        } = req.body;

        if (!name || !price || stock === undefined) {
            return res.status(400).json({
                message: "Please provide product name, price, and stock."
            });
        }

        const newProduct = await pool.query(
            `INSERT INTO products 
                (vendor_id, category_id, name, description, brand, sku, price, stock, discount, image_url, specifications, approval_status, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', 'active')
             RETURNING *`,
            [
                vendorId,
                category_id || null,
                name,
                description || null,
                brand || null,
                sku || null,
                price,
                stock,
                discount || 0.00,
                image_url || null,
                specifications ? JSON.stringify(specifications) : '{}'
            ]
        );

        res.status(201).json({
            success: true,
            message: "Product created successfully (Pending Approval).",
            product: newProduct.rows[0]
        });

    } catch (error) {
        console.error("Error in createProduct:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. UPDATE PRODUCT (Vendor Owner Only - Partial Update Safe)
const updateProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Verify vendor ownership
        const vendorResult = await pool.query("SELECT id FROM vendors WHERE user_id = $1", [userId]);
        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }
        const vendorId = vendorResult.rows[0].id;

        const {
            category_id,
            name,
            description,
            brand,
            sku,
            price,
            stock,
            discount,
            image_url,
            specifications
        } = req.body;

        const result = await pool.query(
            `UPDATE products
             SET
                category_id = COALESCE($1, category_id),
                name = COALESCE($2, name),
                description = COALESCE($3, description),
                brand = COALESCE($4, brand),
                sku = COALESCE($5, sku),
                price = COALESCE($6, price),
                stock = COALESCE($7, stock),
                discount = COALESCE($8, discount),
                image_url = COALESCE($9, image_url),
                specifications = COALESCE($10, specifications),
                updated_at = NOW()
             WHERE id = $11 AND vendor_id = $12
             RETURNING *`,
            [
                category_id || null,
                name || null,
                description || null,
                brand || null,
                sku || null,
                price || null,
                stock !== undefined ? stock : null,
                discount !== undefined ? discount : null,
                image_url || null,
                specifications ? JSON.stringify(specifications) : null,
                id,
                vendorId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found or you are not authorized to edit this product."
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Error in updateProduct:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 5. DELETE PRODUCT (Vendor Owner Only)
const deleteProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const vendorResult = await pool.query("SELECT id FROM vendors WHERE user_id = $1", [userId]);
        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }
        const vendorId = vendorResult.rows[0].id;

        const result = await pool.query(
            "DELETE FROM products WHERE id = $1 AND vendor_id = $2 RETURNING *",
            [id, vendorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found or you are not authorized to delete this product."
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};