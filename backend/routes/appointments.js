const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointment,
  getMyAppointments,
  getAppointmentPdf,
  resendConfirmationEmail,
  cancelAppointment,
  updateAppointmentStatus
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/auth");

router.use(protect); // All appointment endpoints require authentication

router.get("/",                     getMyAppointments);
router.get("/my",                  getMyAppointments);
router.post("/",                    createAppointment);
router.get("/:id",                  getAppointment);
router.patch("/:id/status",         updateAppointmentStatus);
router.get("/:id/pdf",              getAppointmentPdf);
router.post("/:id/resend-email",    resendConfirmationEmail);
router.post("/:id/cancel",          cancelAppointment);

module.exports = router;
