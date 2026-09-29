const express = require("express");
const router = express.Router();
const {
  initiateSslCommerzPayment,
  handleSslCommerzIpn,
  handleSslCommerzSuccess,
  handleSslCommerzFail,
  handleSslCommerzCancel,
  renderSandboxCheckout,
  getPayment,
  getAllTransactions,
  transitionPaymentStatus,
  createPayment,
  handleWebhook
} = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/auth");
const { paymentLimiter } = require("../middleware/rateLimiter");

// ─── SSLCOMMERZ Gateway Callbacks (Public: called by SSLCOMMERZ or browser redirects) ───
router.post("/sslcommerz/ipn",     handleSslCommerzIpn);
router.post("/sslcommerz/success", handleSslCommerzSuccess);
router.post("/sslcommerz/fail",    handleSslCommerzFail);
router.post("/sslcommerz/cancel",  handleSslCommerzCancel);
router.get("/sslcommerz/sandbox-checkout", renderSandboxCheckout);

// Legacy Webhook alias
router.post("/webhook", handleWebhook);

// ─── Protected Routes (JWT required) ─────────────────────────────────────────
router.use(protect);

// Patient initiates SSLCOMMERZ checkout
router.post("/sslcommerz/initiate", paymentLimiter, initiateSslCommerzPayment);

// Standard payment creation & tracking
router.post("/create", paymentLimiter, createPayment);
router.get("/:id", getPayment);

// Admin transaction monitoring
router.get("/", authorize("super_admin", "compliance_auditor"), getAllTransactions);
router.patch("/:id/transition", authorize("super_admin", "compliance_auditor"), transitionPaymentStatus);

module.exports = router;
