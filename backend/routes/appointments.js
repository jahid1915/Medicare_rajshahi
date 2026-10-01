const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointment,
  getMyAppointments,
  getAppointmentPdf,
  resendConfirmationEmail,
  cancelAppointment,
  updateAppointmentStatus,
  requestBookingEmailOtp,
  confirmBookingWithEmailOtp
} = require("../controllers/appointmentController");
const { protect, optionalAuth } = require("../middleware/auth");

// ─── Public / Email OTP Appointment Endpoints ──────────────────────────────
router.post("/request-email-otp", requestBookingEmailOtp);
router.post("/confirm-with-email-otp", optionalAuth, confirmBookingWithEmailOtp);
router.get("/:id/pdf", optionalAuth, getAppointmentPdf);

// ─── Authenticated Routes ──────────────────────────────────────────────────
router.use(protect);

router.get("/",                     getMyAppointments);
router.get("/my",                   getMyAppointments);
router.post("/",                    createAppointment);
router.get("/:id",                  getAppointment);
router.patch("/:id/status",         updateAppointmentStatus);
router.post("/:id/resend-email",    resendConfirmationEmail);
router.post("/:id/cancel",          cancelAppointment);

module.exports = router;

