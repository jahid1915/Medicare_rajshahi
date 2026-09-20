const express = require("express");
const router = express.Router();
const { createAppointment, getAppointment, getMyAppointments } = require("../controllers/appointmentController");
const { protect } = require("../middleware/auth");

router.use(protect); // All appointment routes require auth
router.get("/",    getMyAppointments);
router.post("/",   createAppointment);
router.get("/:id", getAppointment);

module.exports = router;
