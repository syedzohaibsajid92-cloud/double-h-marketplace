const pool = require("../config/db");

// Get all users
const getUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Create a new user
const createUser = async (req, res) => {
    try {

        const { first_name, last_name, email, password, phone } = req.body;

        const result = await pool.query(
            `INSERT INTO users
            (first_name, last_name, email, password, phone)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [first_name, last_name, email, password, phone]
        );

        res.status(201).json({
            message: "User created successfully",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role?.toLowerCase() === "admin";

        if (!isAdmin && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: "You can only view your own profile." });
        }

        const result = await pool.query(
            `SELECT id, first_name, last_name, email, phone, created_at FROM users WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
// Admin - Get all users
const getAllUsers = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                created_at
            FROM users
            ORDER BY id ASC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user.role?.toLowerCase() === "admin";

        if (!isAdmin && req.user.id !== parseInt(id)) {
            return res.status(403).json({ message: "You can only update your own profile." });
        }

        const {
            first_name,
            last_name,
            email,
            phone
        } = req.body;

        const result = await pool.query(
            `UPDATE users
             SET
                first_name = $1,
                last_name = $2,
                email = $3,
                phone = $4
             WHERE id = $5
             RETURNING id, first_name, last_name, email, phone, created_at`,
            [first_name, last_name, email, phone, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
// Delete user
const deleteUser = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM users
             WHERE id = $1
             RETURNING id, first_name, last_name, email`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "User deleted successfully",
            user: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsers
};