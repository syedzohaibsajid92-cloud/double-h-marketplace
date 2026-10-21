const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
    try {

        const totalUsers = await pool.query(
            "SELECT COUNT(*) FROM users"
        );

        const totalProducts = await pool.query(
            "SELECT COUNT(*) FROM products"
        );

        const totalCategories = await pool.query(
            "SELECT COUNT(*) FROM categories"
        );

        const totalOrders = await pool.query(
            "SELECT COUNT(*) FROM orders"
        );

        const totalReviews = await pool.query(
            "SELECT COUNT(*) FROM reviews"
        );

        res.status(200).json({
            totalUsers: Number(totalUsers.rows[0].count),
            totalProducts: Number(totalProducts.rows[0].count),
            totalCategories: Number(totalCategories.rows[0].count),
            totalOrders: Number(totalOrders.rows[0].count),
            totalReviews: Number(totalReviews.rows[0].count)
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });

    }
};

module.exports = {
    getDashboardStats
};