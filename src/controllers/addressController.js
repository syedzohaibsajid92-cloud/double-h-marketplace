const pool = require("../config/db");

// ==============================
// Add Address
// ==============================
const createAddress = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            is_default
        } = req.body;

        if (
            !full_name ||
            !phone ||
            !address_line1 ||
            !city ||
            !state ||
            !postal_code
        ) {
            return res.status(400).json({
                message: "Please provide all required fields."
            });
        }
        // Remove extra spaces
const cleanedData = {
    full_name: full_name.trim(),
    phone: phone.trim(),
    address_line1: address_line1.trim(),
    address_line2: address_line2 ? address_line2.trim() : null,
    city: city.trim(),
    state: state.trim(),
    postal_code: postal_code.trim(),
    country: country ? country.trim() : "Pakistan"
};

// Validate phone
if (!/^[0-9]{10,15}$/.test(cleanedData.phone)) {
    return res.status(400).json({
        message: "Invalid phone number."
    });
}

// Validate postal code
if (!/^[0-9A-Za-z-]{3,10}$/.test(cleanedData.postal_code)) {
    return res.status(400).json({
        message: "Invalid postal code."
    });
}

        // If this address is default, remove default from previous ones
        if (is_default) {
            await pool.query(
                "UPDATE addresses SET is_default = FALSE WHERE user_id = $1",
                [userId]
            );
        }
        // Check duplicate address
const duplicate = await pool.query(
    `SELECT id
     FROM addresses
     WHERE user_id = $1
     AND address_line1 = $2
     AND city = $3
     AND state = $4
     AND postal_code = $5`,
    [
        userId,
        cleanedData.address_line1,
        cleanedData.city,
        cleanedData.state,
        cleanedData.postal_code
    ]
);

if (duplicate.rows.length > 0) {
    return res.status(409).json({
        message: "This address already exists."
    });
}

        const result = await pool.query(
            `INSERT INTO addresses
            (
                user_id,
                full_name,
                phone,
                address_line1,
                address_line2,
                city,
                state,
                postal_code,
                country,
                is_default
            )
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *`,
           [
    userId,
    cleanedData.full_name,
    cleanedData.phone,
    cleanedData.address_line1,
    cleanedData.address_line2,
    cleanedData.city,
    cleanedData.state,
    cleanedData.postal_code,
    cleanedData.country,
    is_default || false
]
        );

        res.status(201).json({
            message: "Address added successfully",
            address: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// ==============================
// Get All Addresses
// ==============================
const getAddresses = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT *
             FROM addresses
             WHERE user_id = $1
             ORDER BY is_default DESC, id DESC`,
            [req.user.id]
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// ==============================
// Get Address By ID
// ==============================
const getAddressById = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT *
             FROM addresses
             WHERE id = $1
             AND user_id = $2`,
            [
                req.params.id,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Address not found"
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

// ==============================
// Update Address
// ==============================
const updateAddress = async (req, res) => {

    try {

        const userId = req.user.id;
        const addressId = req.params.id;

        const {
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            is_default
        } = req.body;
        const cleanedData = {
    full_name: full_name.trim(),
    phone: phone.trim(),
    address_line1: address_line1.trim(),
    address_line2: address_line2 ? address_line2.trim() : null,
    city: city.trim(),
    state: state.trim(),
    postal_code: postal_code.trim(),
    country: country ? country.trim() : "Pakistan"
};

if (!/^[0-9]{10,15}$/.test(cleanedData.phone)) {
    return res.status(400).json({
        message: "Invalid phone number."
    });
}

if (!/^[0-9A-Za-z-]{3,10}$/.test(cleanedData.postal_code)) {
    return res.status(400).json({
        message: "Invalid postal code."
    });
}

        if (is_default) {
            await pool.query(
                "UPDATE addresses SET is_default = FALSE WHERE user_id = $1",
                [userId]
            );
        }

        const result = await pool.query(
            `UPDATE addresses
             SET
                full_name = $1,
                phone = $2,
                address_line1 = $3,
                address_line2 = $4,
                city = $5,
                state = $6,
                postal_code = $7,
                country = $8,
                is_default = $9,
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $10
             AND user_id = $11
             RETURNING *`,
            [
    cleanedData.full_name,
    cleanedData.phone,
    cleanedData.address_line1,
    cleanedData.address_line2,
    cleanedData.city,
    cleanedData.state,
    cleanedData.postal_code,
    cleanedData.country,
    is_default,
    addressId,
    userId
]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        res.status(200).json({
            message: "Address updated successfully",
            address: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// ==============================
// Delete Address
// ==============================
const deleteAddress = async (req, res) => {

    try {

        const result = await pool.query(
            `DELETE FROM addresses
             WHERE id = $1
             AND user_id = $2
             RETURNING *`,
            [
                req.params.id,
                req.user.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        res.status(200).json({
            message: "Address deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// ==============================
// Set Default Address
// ==============================
const setDefaultAddress = async (req, res) => {

    try {

        const userId = req.user.id;
        const addressId = req.params.id;

        await pool.query(
            "UPDATE addresses SET is_default = FALSE WHERE user_id = $1",
            [userId]
        );

        const result = await pool.query(
            `UPDATE addresses
             SET is_default = TRUE
             WHERE id = $1
             AND user_id = $2
             RETURNING *`,
            [
                addressId,
                userId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Address not found"
            });
        }

        res.status(200).json({
            message: "Default address updated successfully",
            address: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};