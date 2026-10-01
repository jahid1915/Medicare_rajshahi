const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  verifyPatientCheckout,
  requestPatientOtp,
  verifyPatientOtp,
  resendPatientOtp
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

// Primary Phone OTP Authentication
router.post("/send-otp",   authLimiter, sendOtp);
router.post("/verify-otp", authLimiter, verifyOtp);

// Profile Management
router.get("/profile",  protect, getProfile);
router.put("/profile",  protect, updateProfile);

// Legacy / Compatibility OTP endpoints
router.post("/patient/request-otp", authLimiter, requestPatientOtp);
router.post("/patient/verify-otp",  authLimiter, verifyPatientOtp);
router.post("/patient/resend-otp",  authLimiter, resendPatientOtp);
router.post("/verify-patient-checkout", authLimiter, verifyPatientCheckout);

// Standard Staff Auth
router.post("/register", authLimiter, register);
router.post("/login",    authLimiter, login);
router.post("/logout",   protect, (req, res) => res.json({ success: true, message: "Logged out successfully" }));
router.get("/me",        protect, getMe);

module.exports = router;

