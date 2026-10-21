const express = require("express");
const router = express.Router();

// Destructure verifyToken from authMiddleware
const { verifyToken } = require("../middleware/authMiddleware");

const {
    getReviewsByProduct,
    addReview,
    updateReview,
    deleteReview
} = require("../controllers/reviewController");

// Public route to view reviews for a product
router.get("/product/:productId", getReviewsByProduct);

// Protected routes (Requires valid login token)
router.post("/", verifyToken, addReview);
router.put("/:id", verifyToken, updateReview);
router.delete("/:id", verifyToken, deleteReview);

module.exports = router;