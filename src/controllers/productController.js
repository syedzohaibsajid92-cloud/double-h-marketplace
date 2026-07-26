const pool = require("../config/db");

// Get all products
const getProducts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                products.*,
                categories.name AS category_name
            FROM products
            JOIN categories
            ON products.category_id = categories.id
            ORDER BY products.id ASC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};
// Get product by ID
const getProductById = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `SELECT
                products.*,
                categories.name AS category_name
             FROM products
             JOIN categories
             ON products.category_id = categories.id
             WHERE products.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
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

// Create a new product
const createProduct = async (req, res) => {
    try {

        const {
            category_id,
            name,
            description,
            brand,
            sku,
            price,
            stock,
            discount,
            image_url
        } = req.body;

        const result = await pool.query(
            `INSERT INTO products
            (
                category_id,
                name,
                description,
                brand,
                sku,
                price,
                stock,
                discount,
                image_url
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`,
            [
                category_id,
                name,
                description,
                brand,
                sku,
                price,
                stock,
                discount,
                image_url
            ]
        );

        res.status(201).json({
            message: "Product created successfully",
            product: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Update product
const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            category_id,
            name,
            description,
            brand,
            sku,
            price,
            stock,
            discount,
            image_url
        } = req.body;

        const result = await pool.query(
            `UPDATE products
             SET
                category_id = $1,
                name = $2,
                description = $3,
                brand = $4,
                sku = $5,
                price = $6,
                stock = $7,
                discount = $8,
                image_url = $9
             WHERE id = $10
             RETURNING *`,
            [
                category_id,
                name,
                description,
                brand,
                sku,
                price,
                stock,
                discount,
                image_url,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
// Delete product
const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM products WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully",
            product: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
// Search Products
const searchProducts = async (req, res) => {
    try {

        const { keyword } = req.query;

        const result = await pool.query(
            `SELECT *
             FROM products
             WHERE LOWER(name) LIKE LOWER($1)`,
            [`%${keyword}%`]
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
// Filter Products
const filterProducts = async (req, res) => {
    try {

        const {
            category,
            brand,
            minPrice,
            maxPrice,
            sort
        } = req.query;

        let query = `
            SELECT
                products.*,
                categories.name AS category_name
            FROM products
            JOIN categories
            ON products.category_id = categories.id
            WHERE 1=1
        `;

        const values = [];
        let index = 1;

        if (category) {
            query += ` AND products.category_id = $${index}`;
            values.push(category);
            index++;
        }

        if (brand) {
            query += ` AND LOWER(products.brand) = LOWER($${index})`;
            values.push(brand);
            index++;
        }

        if (minPrice) {
            query += ` AND products.price >= $${index}`;
            values.push(minPrice);
            index++;
        }

        if (maxPrice) {
            query += ` AND products.price <= $${index}`;
            values.push(maxPrice);
            index++;
        }

        if (sort === "price_asc") {
    query += ` ORDER BY products.price ASC`;
}
else if (sort === "price_desc") {
    query += ` ORDER BY products.price DESC`;
}
else if (sort === "newest") {
    query += ` ORDER BY products.created_at DESC`;
}
else {
    query += ` ORDER BY products.id ASC`;
}
        const result = await pool.query(query, values);

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    filterProducts
};
