const express = require("express");
const rateLimit = require("express-rate-limit");
const { getHint } = require("../controllers/hintController");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

const hintRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message:
      "Too many hint requests. Please wait before asking for another hint.",
  },
});

router.post("/get", hintRateLimit, optionalAuth, getHint);

module.exports = router;
