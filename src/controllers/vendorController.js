const pool = require("../config/db");

// Create Vendor
// Create Vendor
const createVendor = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            business_name,
            business_email,
            business_phone,
            business_address,
            city,
            country,
            description,
            logo_url,
            website_url
        } = req.body;

        // ==========================
        // Required Field Validation
        // ==========================
        if (
            !business_name ||
            !business_email ||
            !business_phone ||
            !business_address ||
            !city ||
            !country
        ) {
            return res.status(400).json({
                message: "Please provide all required vendor information."
            });
        }

        // ==========================
        // Check Existing Vendor
        // ==========================
        const existingVendor = await pool.query(
            "SELECT id FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (existingVendor.rows.length > 0) {
            return res.status(409).json({
                message: "You already have a vendor account."
            });
        }

        // ==========================
        // Create Vendor
        // ==========================
        const result = await pool.query(
            `
            INSERT INTO vendors
            (
                user_id,
                business_name,
                business_email,
                business_phone,
                business_address,
                city,
                country,
                description,
                logo_url,
                website_url,
                commission_rate,
                approval_status,
                status,
                is_active,
                pending_payout,
                total_sales
            )
            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                0,
                'Pending',
                'pending',
                FALSE,
                0,
                0
            )
            RETURNING *;
            `,
            [
                userId,
                business_name,
                business_email,
                business_phone,
                business_address,
                city,
                country,
                description,
                logo_url,
                website_url
            ]
        );

        res.status(201).json({
            message: "Vendor registration submitted successfully. Waiting for admin approval.",
            vendor: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        // Duplicate business_email
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A vendor with this business email already exists."
            });
        }

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get My Own Vendor Record (for the logged-in user)
const getMyVendor = async (req, res) => {
    try {

        const userId = req.user.id;

        const result = await pool.query(
            "SELECT * FROM vendors WHERE user_id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "No vendor account found for this user."
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

const updateVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.role?.toLowerCase() === "admin";

        // Ownership check: vendors can only edit their own record; admins can edit any
        const ownerCheck = await pool.query("SELECT user_id FROM vendors WHERE id = $1", [id]);
        if (ownerCheck.rows.length === 0) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        if (!isAdmin && ownerCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ message: "You can only update your own vendor profile." });
        }

        const {
            business_name,
            description,
            country,
            logo_url,
            website_url,
            commission_rate
        } = req.body;

        // Only admins can change commission_rate
        const result = await pool.query(
            `UPDATE vendors
             SET
                business_name = $1,
                description = $2,
                country = $3,
                logo_url = $4,
                website_url = $5,
                commission_rate = ${isAdmin ? "$6" : "commission_rate"}
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

        res.status(200).json({
            message: "Vendor updated successfully",
            vendor: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
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
    getMyVendor,
    getVendors,
    getVendorById,
    updateVendor,
    deleteVendor
};