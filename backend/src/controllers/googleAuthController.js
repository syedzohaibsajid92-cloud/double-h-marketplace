const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

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
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, refreshTokenHash, expiresAt]
    );

    return { accessToken, refreshToken };
}

// POST /api/auth/google
// Body: { idToken }  <-- the ID token obtained on the frontend via Google Sign-In
const googleLogin = async (req, res) => {
    try {

        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                message: "Google idToken is required"
            });
        }

        // Verify the token with Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name } = payload;

        if (!email) {
            return res.status(400).json({
                message: "Google account has no email"
            });
        }

        // Find existing user, or create a new one
        let userResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        let user;

        if (userResult.rows.length === 0) {
            // No password for Google-only accounts — store a random unusable hash
            const randomPassword = crypto.randomBytes(32).toString("hex");
            const bcrypt = require("bcrypt");
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            const insertResult = await pool.query(
                `INSERT INTO users
                (first_name, last_name, email, password, is_verified)
                VALUES ($1, $2, $3, $4, TRUE)
                RETURNING *`,
                [given_name || "Google", family_name || "User", email, hashedPassword]
            );

            user = insertResult.rows[0];
        } else {
            user = userResult.rows[0];

            // Google has already verified this email — reflect that locally too
            if (!user.is_verified) {
                await pool.query(
                    `UPDATE users SET is_verified = TRUE WHERE id = $1`,
                    [user.id]
                );
            }
        }

        const { accessToken, refreshToken } = await issueTokenPair(user);

        res.status(200).json({
            message: "Google login successful",
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error(error);

        res.status(401).json({
            message: "Invalid Google token"
        });

    }
};

module.exports = { googleLogin };