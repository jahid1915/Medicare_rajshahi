const express = require("express");
const router = express.Router();
const { createPayment, handleWebhook, getPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");
const { paymentLimiter } = require("../middleware/rateLimiter");

// Webhook does NOT require JWT auth — it comes from the payment gateway
router.post("/webhook", handleWebhook);

// All other payment routes require auth
router.use(protect);
router.post("/create", paymentLimiter, createPayment);
router.get("/:id", getPayment);

module.exports = router;
