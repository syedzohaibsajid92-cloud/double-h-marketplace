const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// 1. Upload Product Image Endpoint
const uploadProductImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please select an image file to upload." });
        }

        // Generate public image URL
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully.",
            image_url: imageUrl
        });

    } catch (error) {
        console.error("Image upload error:", error);
        res.status(500).json({ message: "Image upload failed." });
    }
};

// 2. Attach Uploaded Image to Product Directly
const setProductImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: "Please attach an image file." });
        }

        // Verify Vendor Ownership
        const vendorResult = await pool.query("SELECT id FROM vendors WHERE user_id = $1", [userId]);
        if (vendorResult.rows.length === 0) {
            return res.status(403).json({ message: "Vendor account not found." });
        }
        const vendorId = vendorResult.rows[0].id;

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const result = await pool.query(
            "UPDATE products SET image_url = $1, updated_at = NOW() WHERE id = $2 AND vendor_id = $3 RETURNING *",
            [imageUrl, id, vendorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product not found or unauthorized." });
        }

        res.status(200).json({
            success: true,
            message: "Product image updated successfully.",
            product: result.rows[0]
        });

    } catch (error) {
        console.error("Set product image error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    uploadProductImage,
    setProductImage
};