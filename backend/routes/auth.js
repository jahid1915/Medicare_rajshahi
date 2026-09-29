const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  sendOtp,
  verifyPatientCheckout,
  requestPatientOtp,
  verifyPatientOtp,
  resendPatientOtp
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

// Patient OTP Authentication
router.post("/patient/request-otp", authLimiter, requestPatientOtp);
router.post("/patient/verify-otp",  authLimiter, verifyPatientOtp);
router.post("/patient/resend-otp",  authLimiter, resendPatientOtp);

// Legacy checkout OTP endpoints
router.post("/send-otp",                 authLimiter, sendOtp);
router.post("/verify-patient-checkout",  authLimiter, verifyPatientCheckout);

// Standard Auth
router.post("/register", authLimiter, register);
router.post("/login",    authLimiter, login);
router.post("/logout",   protect, (req, res) => res.json({ success: true, message: "Logged out successfully" }));
router.get("/me",        protect, getMe);

module.exports = router;
