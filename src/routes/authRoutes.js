const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const { googleLogin } = require("../controllers/googleAuthController");

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Google OAuth Login
router.post("/google", googleLogin);

// Forgot Password
router.post("/forgot-password", authController.forgotPassword);

// Verify OTP
router.post("/verify-otp", authController.verifyOTP);

// Reset Password
router.post("/reset-password", authController.resetPassword);

// Refresh Token Rotation
router.post("/refresh-token", authController.refreshToken);

// Logout
router.post("/logout", authController.logout);

// Email Verification
router.post("/verify-email", authController.verifyEmail);

// Resend Verification Email
router.post("/resend-verification", authController.resendVerificationEmail);

module.exports = router;