const express = require('express');
const router = express.Router();
const { requestReturn } = require('../controllers/returnController');
const authMiddleware = require('../middleware/authMiddleware'); // Update path if your auth middleware is located elsewhere

// POST /api/returns
router.post('/', authMiddleware, requestReturn);

module.exports = router;