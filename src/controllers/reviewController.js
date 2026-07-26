const pool = require("../config/db");

// Helper function to reliably get user_id from authMiddleware
const getUserId = (req) => req.user?.id || req.user?.user_id || req.user?.userId;

// 1. Add Review
const addReview = async (req, res) => {
    try {
        const user_id = getUserId(req);
        const { product_id, rating, review } = req.body;

        if (!user_id) {
            return res.status(401).json({ message: "Unauthorized: User ID not found in token." });
        }

        if (!product_id || !rating) {
            return res.status(400).json({ message: "product_id and rating are required." });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5." });
        }

        // Uses 'review' column in PostgreSQL table
        const result = await pool.query(
            `INSERT INTO reviews (user_id, product_id, rating, review)
             VALUES ($1, $2, $3, $4)
             RETURNING id, user_id, product_id, rating, review, created_at`,
            [user_id, product_id, rating, review]
        );

        res.status(201).json({
            message: "Review added successfully",
            review: result.rows[0]
        });

    } catch (error) {
        console.error("Error in addReview:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Get Reviews by Product
const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const result = await pool.query(
            `SELECT
                r.id,
                r.rating,
                r.review,
                r.created_at,
                CONCAT(u.first_name, ' ', u.last_name) AS reviewer_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = $1
            ORDER BY r.created_at DESC`,
            [productId]
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error in getReviewsByProduct:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 3. Update Review (With partial update fallback)
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = getUserId(req);
        const { rating, review } = req.body;

        // COALESCE keeps existing values if new ones aren't provided in req.body
        const result = await pool.query(
            `UPDATE reviews
             SET rating = COALESCE($1, rating),
                 review = COALESCE($2, review)
             WHERE id = $3 AND user_id = $4
             RETURNING id, user_id, product_id, rating, review, created_at`,
            [rating || null, review || null, id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Review not found or unauthorized to update"
            });
        }

        res.status(200).json({
            message: "Review updated successfully",
            review: result.rows[0]
        });

    } catch (error) {
        console.error("Error in updateReview:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// 4. Delete Review (Checks ownership)
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = getUserId(req);

        const result = await pool.query(
            `DELETE FROM reviews
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Review not found or unauthorized to delete"
            });
        }

        res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Error in deleteReview:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 5. Get All Reviews (Admin route)
const getAllReviews = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                r.id,
                r.rating,
                r.review,
                r.created_at,
                CONCAT(u.first_name, ' ', u.last_name) AS reviewer_name,
                p.name AS product_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN products p ON r.product_id = p.id
            ORDER BY r.created_at DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error("Error in getAllReviews:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    addReview,
    getAllReviews,
    getReviewsByProduct,
    updateReview,
    deleteReview
};