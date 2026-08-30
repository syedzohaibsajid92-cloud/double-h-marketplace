const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const authController = require("../controllers/authController");
const { googleLogin } = require("../controllers/googleAuthController");
const { verifyToken } = require("../middleware/authMiddleware");

// Limits repeated login attempts to slow down brute-force password guessing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================================
// PUBLIC AUTH ROUTES
// ==========================================

// Register
router.post("/register", authController.register);

// Login (rate-limited to slow brute-force attempts)
router.post("/login", loginLimiter, authController.login);

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


// ==========================================
// PROTECTED AUTH ROUTES (Token Required)
// ==========================================

// Get Current User Profile (Verifies JWT session)
router.get("/me", verifyToken, authController.getMe || ((req, res) => {
  res.status(200).json({ success: true, user: req.user });
}));

module.exports = router;