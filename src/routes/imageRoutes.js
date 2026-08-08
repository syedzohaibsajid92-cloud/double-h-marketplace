const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

// Destructure verifyToken from authMiddleware
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadProductImage, setProductImage } = require('../controllers/imageController');

// Standalone Upload (Returns image_url string)
router.post('/upload', verifyToken, upload.single('image'), uploadProductImage);

// Direct Product Image Update (/api/images/products/:id)
router.post('/products/:id', verifyToken, upload.single('image'), setProductImage);

module.exports = router;