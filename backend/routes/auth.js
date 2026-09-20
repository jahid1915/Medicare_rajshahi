const express = require("express");
const router = express.Router();
const { register, login, getMe, sendOtp, verifyPatientCheckout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, register);
router.post("/login",    authLimiter, login);
router.post("/send-otp", authLimiter, sendOtp);
router.post("/verify-patient-checkout", authLimiter, verifyPatientCheckout);
router.get("/me",        protect, getMe);

module.exports = router;
