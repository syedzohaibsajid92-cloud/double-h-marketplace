const express = require("express");
const router = express.Router();


const {
    addToCart,
    getCart
} = require("../controllers/cartController");

const verifyToken = require("../middleware/authMiddleware");
router.post("/", verifyToken, addToCart);

router.get("/:user_id", verifyToken, getCart);


module.exports = router;