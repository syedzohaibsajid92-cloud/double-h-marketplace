const express = require('express');
const router = express.Router();
const { requestReturn } = require('../controllers/returnController');

// Destructure verifyToken from authMiddleware
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/returns
router.post('/', verifyToken, requestReturn);

module.exports = router;