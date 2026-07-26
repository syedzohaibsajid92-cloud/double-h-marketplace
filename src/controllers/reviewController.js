const pool = require("../config/db");

// Add Review
const addReview = async (req, res) => {
    try {

        const { user_id, product_id, rating, review } = req.body;

        const result = await pool.query(
            `INSERT INTO reviews
            (user_id, product_id, rating, review)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [user_id, product_id, rating, review]
        );

        res.status(201).json({
            message: "Review added successfully",
            review: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

const getReviewsByProduct = async (req, res) => {
    try {

        const { productId } = req.params;

        const result = await pool.query(
            `SELECT
                reviews.id,
                reviews.rating,
                reviews.review,
                reviews.created_at,
                users.first_name,
                users.last_name
            FROM reviews
            JOIN users
                ON reviews.user_id = users.id
            WHERE reviews.product_id = $1
            ORDER BY reviews.created_at DESC`,
            [productId]
        );

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

const updateReview = async (req, res) => {
    try {

        const { id } = req.params;
        const { rating, review } = req.body;

        const result = await pool.query(
            `UPDATE reviews
             SET rating = $1,
                 review = $2
             WHERE id = $3
             RETURNING *`,
            [rating, review, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        res.status(200).json({
            message: "Review updated successfully",
            review: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

const deleteReview = async (req, res) => {
    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM reviews
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
// Get all reviews
const getAllReviews = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                reviews.id,
                reviews.rating,
                reviews.review,
                reviews.created_at,
                users.first_name,
                users.last_name,
                products.name AS product_name
            FROM reviews
            JOIN users
                ON reviews.user_id = users.id
            JOIN products
                ON reviews.product_id = products.id
            ORDER BY reviews.created_at DESC
        `);

        res.status(200).json(result.rows);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};
module.exports = {
    addReview,
    getAllReviews,
    getReviewsByProduct,
    updateReview,
    deleteReview
};