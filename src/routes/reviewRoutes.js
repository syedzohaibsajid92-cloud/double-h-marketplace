const express = require("express");
const router = express.Router();

const {
    addReview,
    getAllReviews,
    getReviewsByProduct,
    updateReview,
    deleteReview
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

// Add review
router.post("/", authMiddleware, addReview);

// Get all reviews (Admin)
router.get("/", getAllReviews);

// Get reviews for a product
router.get("/product/:productId", getReviewsByProduct);

// Update review
router.put("/:id", authMiddleware, updateReview);

// Delete review
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;