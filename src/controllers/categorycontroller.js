const pool = require("../config/db");

// Helper function to create URL-friendly slugs
const createSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

// Get all categories
const getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM categories ORDER BY id ASC"
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            categories: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get category by ID
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM categories WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            success: true,
            category: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Create a new category
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const slug = createSlug(name);

        const result = await pool.query(
            `INSERT INTO categories (name, slug, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, slug, description || null]
        );

        res.status(201).json({
            message: "Category created successfully",
            category: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        
        // Postgres error code 23505 = unique constraint violation (duplicate name/slug)
        if (error.code === "23505") {
            return res.status(400).json({ message: "Category already exists" });
        }

        res.status(500).json({ message: "Server Error" });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const slug = name ? createSlug(name) : null;

        // Uses COALESCE so missing fields retain their original database values
        const result = await pool.query(
            `UPDATE categories
             SET name = COALESCE($1, name),
                 slug = COALESCE($2, slug),
                 description = COALESCE($3, description)
             WHERE id = $4
             RETURNING *`,
            [name || null, slug || null, description || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category updated successfully",
            category: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(400).json({ message: "Category name or slug already exists" });
        }

        res.status(500).json({ message: "Server Error" });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM categories WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};