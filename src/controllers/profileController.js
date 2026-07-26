const pool = require("../config/db");
const bcrypt = require("bcrypt");

// ==============================
// Get Logged-in User Profile
// ==============================
const getProfile = async (req, res) => {
    try {

        const userId = req.user.id;

        const result = await pool.query(
            `SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                role,
                profile_image,
                date_of_birth,
                gender,
                is_verified,
                created_at
            FROM users
            WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
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
// Update Profile
// ==============================
const updateProfile = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            first_name,
            last_name,
            phone,
            gender,
            date_of_birth,
            profile_image
        } = req.body;

        const result = await pool.query(
            `UPDATE users
             SET
                first_name = $1,
                last_name = $2,
                phone = $3,
                gender = $4,
                date_of_birth = $5,
                profile_image = $6
             WHERE id = $7
             RETURNING
                id,
                first_name,
                last_name,
                email,
                phone,
                role,
                profile_image,
                date_of_birth,
                gender,
                is_verified,
                created_at`,
            [
                first_name,
                last_name,
                phone,
                gender,
                date_of_birth,
                profile_image,
                userId
            ]
        );

        res.status(200).json({
            message: "Profile updated successfully",
            user: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

// ==============================
// Change Password
// ==============================
const changePassword = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;

        const result = await pool.query(
            "SELECT password FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users
             SET password = $1
             WHERE id = $2`,
            [
                hashedPassword,
                userId
            ]
        );

        res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};