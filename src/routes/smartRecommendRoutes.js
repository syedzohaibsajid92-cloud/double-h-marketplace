const express = require("express");
const multer = require("multer");
const { getSmartRecommendation } = require("../controllers/smartRecommendController");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/", upload.single("image"), getSmartRecommendation);

module.exports = router;