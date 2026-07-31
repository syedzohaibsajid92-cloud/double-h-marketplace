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

// 1. Get all brands
const getBrands = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM brands ORDER BY id ASC"
        );

        res.status(200).json({
            success: true,
            count: result.rows.length,
            brands: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 2. Get single brand by ID
const getBrandById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM brands WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Brand not found" });
        }

        res.status(200).json({
            success: true,
            brand: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. Create a new brand
const createBrand = async (req, res) => {
    try {
        const { name, logo_url, description, website } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Brand name is required" });
        }

        const slug = createSlug(name);

        const result = await pool.query(
            `INSERT INTO brands (name, slug, logo_url, description, website)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [name, slug, logo_url || null, description || null, website || null]
        );

        res.status(201).json({
            success: true,
            message: "Brand created successfully",
            brand: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(400).json({ message: "Brand already exists" });
        }

        res.status(500).json({ message: "Server Error" });
    }
};

// 4. Update brand
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, logo_url, description, website } = req.body;

        const slug = name ? createSlug(name) : null;

        const result = await pool.query(
            `UPDATE brands
             SET name = COALESCE($1, name),
                 slug = COALESCE($2, slug),
                 logo_url = COALESCE($3, logo_url),
                 description = COALESCE($4, description),
                 website = COALESCE($5, website)
             WHERE id = $6
             RETURNING *`,
            [name || null, slug || null, logo_url || null, description || null, website || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Brand not found" });
        }

        res.status(200).json({
            success: true,
            message: "Brand updated successfully",
            brand: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(400).json({ message: "Brand name or slug already exists" });
        }

        res.status(500).json({ message: "Server Error" });
    }
};

// 5. Delete brand
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM brands WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Brand not found" });
        }

        res.status(200).json({
            success: true,
            message: "Brand deleted successfully"
        });

    } catch (error) {
        console.error(error);

        // Code 23503 = foreign key violation (brand attached to existing products)
        if (error.code === "23503") {
            return res.status(400).json({ message: "Cannot delete brand associated with active products" });
        }

        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};