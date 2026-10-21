const express = require("express");
const router = express.Router();

const {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    sendEmailNotification,
    sendSMSNotification,
    sendPushNotification,
    sendOrderAlert,
    sendMarketingNotification
} = require("../controllers/notificationController");

// Base Create Notification
router.post("/", createNotification);

// Specific Module Tasks
router.post("/email", sendEmailNotification);        // Task 1: Email Service
router.post("/sms", sendSMSNotification);            // Task 2: SMS Service
router.post("/push", sendPushNotification);          // Task 3: Push Service
router.post("/order-alert", sendOrderAlert);         // Task 4: Order Alert Triggers
router.post("/marketing", sendMarketingNotification); // Task 5: Marketing Pipeline

// Get User Notifications & Update Status
router.get("/:userId", getUserNotifications);
router.put("/:id", markNotificationAsRead);

module.exports = router;