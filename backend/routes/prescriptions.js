const express = require("express");
const router = express.Router();
const {
  createPrescription,
  getMyPrescriptions,
  getPrescriptionById
} = require("../controllers/prescriptionController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.post("/", createPrescription);
router.get("/my-prescriptions", getMyPrescriptions);
router.get("/:id", getPrescriptionById);

module.exports = router;
