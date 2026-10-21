const pool = require("../config/db");

// ==========================================
// EXISTING HANDLERS
// ==========================================
const createNotification = async (req, res) => {
    try {
        const { user_id, message, type } = req.body;
        const result = await pool.query(
            `INSERT INTO notifications (user_id, message, type, status)
             VALUES ($1, $2, $3, 'sent') RETURNING *;`,
            [user_id, message, type || 'general']
        );
        res.status(201).json({ message: "Notification created successfully", notification: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY id DESC", [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Notification not found" });
        res.status(200).json({ message: "Notification marked as read", notification: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ==========================================
// TASK 1: EMAIL SERVICE
// ==========================================
// ==========================================
// TASK 1: EMAIL SERVICE
// ==========================================
const sendEmailNotification = async (req, res) => {
    try {
        const { user_id, recipient_email, subject, message } = req.body;
        if (!recipient_email || !subject || !message) {
            return res.status(400).json({ message: "recipient_email, subject, and message are required." });
        }

        console.log(`[EMAIL DISPATCH] To: ${recipient_email} | Subject: ${subject}`);
        
        // Include title alongside subject to satisfy NOT NULL constraint
        const result = await pool.query(
            `INSERT INTO notifications (user_id, title, type, recipient, subject, message, status)
             VALUES ($1, $2, 'email', $3, $4, $5, 'sent') RETURNING *;`,
            [user_id || null, subject, recipient_email, subject, message]
        );

        res.status(201).json({ 
            message: "Email notification sent successfully.", 
            notification: result.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error sending email." });
    }
};

// ==========================================
// TASK 2: SMS SERVICE
// ==========================================
const sendSMSNotification = async (req, res) => {
    try {
        const { user_id, phone_number, message } = req.body;
        if (!phone_number || !message) {
            return res.status(400).json({ message: "phone_number and message are required." });
        }

        console.log(`[SMS DISPATCH] To: ${phone_number} | Message: ${message}`);
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, recipient, message, status)
             VALUES ($1, 'sms', $2, $3, 'sent') RETURNING *;`,
            [user_id || null, phone_number, message]
        );

        res.status(201).json({ message: "SMS notification sent successfully.", notification: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error sending SMS." });
    }
};

// ==========================================
// TASK 3: PUSH NOTIFICATION SERVICE
// ==========================================
const sendPushNotification = async (req, res) => {
    try {
        const { user_id, device_token, title, message } = req.body;
        if (!device_token || !title || !message) {
            return res.status(400).json({ message: "device_token, title, and message are required." });
        }

        console.log(`[PUSH DISPATCH] Token: ${device_token} | Title: ${title}`);
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, recipient, subject, message, status)
             VALUES ($1, 'push', $2, $3, $4, 'sent') RETURNING *;`,
            [user_id || null, device_token, title, message]
        );

        res.status(201).json({ message: "Push notification sent successfully.", notification: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error sending push notification." });
    }
};

// ==========================================
// TASK 4: ORDER ALERT TRIGGERS
// ==========================================
const sendOrderAlert = async (req, res) => {
    try {
        const { user_id, order_id, status_event } = req.body; // e.g., 'dispatched', 'delivered'
        if (!user_id || !order_id || !status_event) {
            return res.status(400).json({ message: "user_id, order_id, and status_event are required." });
        }

        const alertMessage = `Order #${order_id} update: Your order status is now '${status_event}'.`;
        console.log(`[ORDER ALERT] User: ${user_id} | Order: ${order_id} | Event: ${status_event}`);

        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, recipient, subject, message, status)
             VALUES ($1, 'order_alert', $2, 'Order Update Alert', $3, 'sent') RETURNING *;`,
            [user_id, `order_${order_id}`, alertMessage]
        );

        res.status(201).json({ message: "Order alert triggered successfully.", notification: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error sending order alert." });
    }
};

// ==========================================
// TASK 5: MARKETING NOTIFICATION PIPELINE
// ==========================================
const sendMarketingNotification = async (req, res) => {
    try {
        const { campaign_title, promo_code, message } = req.body;
        if (!campaign_title || !message) {
            return res.status(400).json({ message: "campaign_title and message are required." });
        }

        console.log(`[MARKETING CAMPAIGN] ${campaign_title} Broadcasted`);
        const result = await pool.query(
            `INSERT INTO notifications (user_id, type, recipient, subject, message, status)
             VALUES (NULL, 'marketing', 'all_users', $1, $2, 'sent') RETURNING *;`,
            [campaign_title, `${message} ${promo_code ? 'Use Code: ' + promo_code : ''}`]
        );

        res.status(201).json({ message: "Marketing campaign dispatches successfully.", notification: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error sending marketing notification." });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    sendEmailNotification,
    sendSMSNotification,
    sendPushNotification,
    sendOrderAlert,
    sendMarketingNotification
};