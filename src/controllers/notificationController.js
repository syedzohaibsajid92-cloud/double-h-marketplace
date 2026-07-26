const pool = require("../config/db");

// Create Notification
const createNotification = async (req, res) => {
    try {

        const {
            user_id,
            title,
            message
        } = req.body;

        const result = await pool.query(
            `INSERT INTO notifications
            (
                user_id,
                title,
                message
            )
            VALUES ($1,$2,$3)
            RETURNING *`,
            [
                user_id,
                title,
                message
            ]
        );

        res.status(201).json({
            message: "Notification created successfully",
            notification: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Invalid User ID."
            });
        }

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Get User Notifications
const getUserNotifications = async (req, res) => {
    try {

        const { userId } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Mark Notification as Read
const markNotificationAsRead = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.status(200).json({
            message: "Notification marked as read",
            notification: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead
};