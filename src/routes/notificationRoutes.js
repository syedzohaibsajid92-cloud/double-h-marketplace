const express = require("express");

const router = express.Router();

const {
    createNotification,
    getUserNotifications,
    markNotificationAsRead
} = require("../controllers/notificationController");

// Create Notification
router.post("/", createNotification);

// Get User Notifications
router.get("/:userId", getUserNotifications);

// Mark Notification as Read
router.put("/:id", markNotificationAsRead);

module.exports = router;