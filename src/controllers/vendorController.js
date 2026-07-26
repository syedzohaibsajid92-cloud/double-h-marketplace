const pool = require("../config/db");

// Create Vendor
const createVendor = async (req, res) => {
    try {

        const {
            user_id,
            business_name,
            description,
            country,
            logo_url,
            website_url,
            commission_rate
        } = req.body;

        const result = await pool.query(
            `
            INSERT INTO vendors
            (
                user_id,
                business_name,
                description,
                country,
                logo_url,
                website_url,
                commission_rate
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *;
            `,
            [
                user_id,
                business_name,
                description,
                country,
                logo_url,
                website_url,
                commission_rate
            ]
        );

        res.status(201).json({
            message: "Vendor created successfully",
            vendor: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        // User already has a vendor account
        if (error.code === "23505") {
            return res.status(409).json({
                message: "This user already has a vendor account."
            });
        }

        // Missing required field
        if (error.code === "23502") {
            return res.status(400).json({
                message: "Required vendor information is missing."
            });
        }

        // Foreign key error
        if (error.code === "23503") {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get All Vendors
const getVendors = async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT * FROM vendors ORDER BY id ASC"
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get Vendor By ID
const getVendorById = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM vendors WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Vendor not found"
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

// Update Vendor
const updateVendor = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            business_name,
            description,
            country,
            logo_url,
            website_url,
            commission_rate
        } = req.body;

        const result = await pool.query(
            `UPDATE vendors
             SET
                business_name = $1,
                description = $2,
                country = $3,
                logo_url = $4,
                website_url = $5,
                commission_rate = $6
             WHERE id = $7
             RETURNING *`,
            [
                business_name,
                description,
                country,
                logo_url,
                website_url,
                commission_rate,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }

        res.status(200).json({
            message: "Vendor updated successfully",
            vendor: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
// Delete Vendor
const deleteVendor = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM vendors WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }

        res.status(200).json({
            message: "Vendor deleted successfully",
            vendor: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
module.exports = {
    createVendor,
    getVendors,
    getVendorById,
    updateVendor,
    deleteVendor
};