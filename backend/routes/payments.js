const express = require("express");
const router = express.Router();
const {
  createPayment,
  handleWebhook,
  getPayment,
  getAllTransactions,
  transitionPaymentStatus
} = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/auth");
const { paymentLimiter } = require("../middleware/rateLimiter");

// Webhook does NOT require JWT auth — it comes from the payment gateway
router.post("/webhook", handleWebhook);

// All other payment routes require auth
router.use(protect);

// Admin transaction monitoring & audit routes
router.get("/", authorize("super_admin", "compliance_auditor"), getAllTransactions);
router.patch("/:id/transition", authorize("super_admin", "compliance_auditor"), transitionPaymentStatus);

// Payment lifecycle
router.post("/create", paymentLimiter, createPayment);
router.get("/:id", getPayment);

module.exports = router;
