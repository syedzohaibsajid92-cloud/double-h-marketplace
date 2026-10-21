const pool = require("../config/db");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ---------- Helper: hash a refresh token for storage ----------
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

// ---------- Helper: issue access + refresh token pair ----------
async function issueTokenPair(user) {
    const accessToken = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET || "double_h_secret_key",
        {
            expiresIn: "15m"
        }
    );

    const refreshToken = crypto.randomBytes(40).toString("hex");
    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, refreshTokenHash, expiresAt]
    );

    return { accessToken, refreshToken };
}

// Register User
const register = async (req, res) => {
    try {

        const {
            first_name,
            last_name,
            email,
            password,
            phone
        } = req.body;

        // Check required fields
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        // Validate email
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: "Invalid email address"
            });
        }

        // Check if email already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users
            (first_name, last_name, email, password, phone)
            VALUES ($1,$2,$3,$4,$5)
            RETURNING id, first_name, last_name, email, phone, is_verified`,
            [
                first_name,
                last_name,
                email,
                hashedPassword,
                phone
            ]
        );

        const newUser = result.rows[0];

        // Generate email verification OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(
            `INSERT INTO otp_verifications
            (user_id, otp_code, purpose, expires_at)
            VALUES ($1,$2,$3,$4)`,
            [newUser.id, otp, "email_verification", expiresAt]
        );

        // NOTE: in production this OTP should be emailed, not returned in the
        // response. Returning it here for now so it can be tested via Postman,
        // the same way forgotPassword already does.
        res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            user: newUser,
            emailVerificationOtp: otp
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Login User
const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const { accessToken, refreshToken } = await issueTokenPair(user);

        res.status(200).json({
            message: "Login successful",
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                is_verified: user.is_verified
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Refresh Access Token (rotation: old refresh token is revoked, new one issued)
const refreshToken = async (req, res) => {
    try {

        const { refreshToken: incomingToken } = req.body;

        if (!incomingToken) {
            return res.status(400).json({
                message: "Refresh token is required"
            });
        }

        const tokenHash = hashToken(incomingToken);

        const tokenResult = await pool.query(
            `SELECT * FROM refresh_tokens
             WHERE token_hash = $1 AND revoked = FALSE`,
            [tokenHash]
        );

        if (tokenResult.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid or already used refresh token"
            });
        }

        const storedToken = tokenResult.rows[0];

        if (new Date() > storedToken.expires_at) {
            return res.status(401).json({
                message: "Refresh token has expired. Please log in again."
            });
        }

        // Revoke the old refresh token (rotation)
        await pool.query(
            `UPDATE refresh_tokens SET revoked = TRUE WHERE id = $1`,
            [storedToken.id]
        );

        // Fetch the user and issue a new token pair
        const userResult = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [storedToken.user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(userResult.rows[0]);

        res.status(200).json({
            message: "Token refreshed successfully",
            token: accessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Logout (revoke a specific refresh token)
const logout = async (req, res) => {
    try {

        const { refreshToken: incomingToken } = req.body;

        if (!incomingToken) {
            return res.status(400).json({
                message: "Refresh token is required"
            });
        }

        const tokenHash = hashToken(incomingToken);

        await pool.query(
            `UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`,
            [tokenHash]
        );

        res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Verify Email (using OTP sent at registration)
const verifyEmail = async (req, res) => {
    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        const userResult = await pool.query(
            "SELECT id, is_verified FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = userResult.rows[0];

        if (user.is_verified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        const otpResult = await pool.query(
            `SELECT *
             FROM otp_verifications
             WHERE user_id = $1
             AND otp_code = $2
             AND purpose = 'email_verification'
             ORDER BY id DESC
             LIMIT 1`,
            [user.id, otp]
        );

        if (otpResult.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        const otpData = otpResult.rows[0];

        if (new Date() > otpData.expires_at) {
            return res.status(400).json({
                message: "OTP has expired"
            });
        }

        await pool.query(
            `UPDATE otp_verifications SET is_verified = TRUE WHERE id = $1`,
            [otpData.id]
        );

        await pool.query(
            `UPDATE users SET is_verified = TRUE WHERE id = $1`,
            [user.id]
        );

        res.status(200).json({
            message: "Email verified successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Resend Email Verification OTP
const resendVerificationEmail = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const userResult = await pool.query(
            "SELECT id, is_verified FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = userResult.rows[0];

        if (user.is_verified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(
            `INSERT INTO otp_verifications
            (user_id, otp_code, purpose, expires_at)
            VALUES ($1,$2,$3,$4)`,
            [user.id, otp, "email_verification", expiresAt]
        );

        res.status(200).json({
            message: "Verification OTP resent successfully",
            emailVerificationOtp: otp
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const userResult = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "Email not found"
            });
        }

        const userId = userResult.rows[0].id;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(
`
INSERT INTO otp_verifications
(user_id, otp_code, purpose, expires_at)
VALUES ($1,$2,$3,$4)
`,
[
    userId,
    otp,
    "forgot_password",
    expiresAt
]
);
        res.status(200).json({
            message: "OTP generated successfully",
            otp
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        // Find user
        const userResult = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const userId = userResult.rows[0].id;

        // Find latest OTP
        const otpResult = await pool.query(
            `SELECT *
             FROM otp_verifications
             WHERE user_id = $1
             AND otp_code = $2
             AND purpose = 'forgot_password'
             ORDER BY id DESC
             LIMIT 1`,
            [userId, otp]
        );

        if (otpResult.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        const otpData = otpResult.rows[0];

        // Check expiry
        if (new Date() > otpData.expires_at) {
            return res.status(400).json({
                message: "OTP has expired"
            });
        }

        // Mark OTP as verified
        await pool.query(
            `UPDATE otp_verifications
             SET is_verified = TRUE
             WHERE id = $1`,
            [otpData.id]
        );

        res.status(200).json({
            message: "OTP verified successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
// Reset Password
const resetPassword = async (req, res) => {
    try {

        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                message: "Email and new password are required"
            });
        }

        // Find user
        const userResult = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const userId = userResult.rows[0].id;

        // Check if OTP was verified
        const otpResult = await pool.query(
            `SELECT *
             FROM otp_verifications
             WHERE user_id = $1
             AND purpose = 'forgot_password'
             AND is_verified = TRUE
             ORDER BY id DESC
             LIMIT 1`,
            [userId]
        );

        if (otpResult.rows.length === 0) {
            return res.status(400).json({
                message: "OTP verification required"
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.query(
            `UPDATE users
             SET password = $1
             WHERE id = $2`,
            [hashedPassword, userId]
        );

        res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
module.exports = {
    register,
    login,
    refreshToken,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    verifyOTP,
    resetPassword
};