const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const protect = require('../middleware/authMiddleware');
const { uploadProductImage, setProductImage } = require('../controllers/imageController');

// Standalone Upload (Returns image_url string)
router.post('/upload', protect, upload.single('image'), uploadProductImage);

// Direct Product Image Update (/api/images/products/:id)
router.post('/products/:id', protect, upload.single('image'), setProductImage);

module.exports = router;