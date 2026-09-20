const express = require("express");
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  getCategories,
  createMedicine
} = require("../controllers/medicineController");
const { protect, authorize } = require("../middleware/auth");

// Public
router.get("/", getMedicines);
router.get("/meta/categories", getCategories);
router.get("/:id", getMedicineById);

// Protected (super_admin, pharmacy_owner, pharmacist)
router.post("/", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), createMedicine);

module.exports = router;
