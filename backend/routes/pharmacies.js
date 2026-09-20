const express = require("express");
const router = express.Router();
const {
  getPharmacies,
  getPharmacyById,
  getMyPharmacy,
  createPharmacy,
  updatePharmacy,
  getPharmacyInventory,
  addInventoryItem,
  deleteInventoryItem
} = require("../controllers/pharmacyController");
const { protect, authorize, ownPharmacyOnly } = require("../middleware/auth");

// Public routes
router.get("/", getPharmacies);
router.get("/my-pharmacy", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), getMyPharmacy);
router.get("/:id", getPharmacyById);
router.get("/:id/inventory", getPharmacyInventory);

// Protected routes (pharmacy_owner, pharmacist, super_admin)
router.post("/", protect, authorize("pharmacy_owner", "super_admin"), createPharmacy);
router.patch("/:id", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), ownPharmacyOnly, updatePharmacy);
router.put("/:id", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), ownPharmacyOnly, updatePharmacy);
router.post("/:id/inventory", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), ownPharmacyOnly, addInventoryItem);
router.delete("/:id/inventory/:itemId", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), ownPharmacyOnly, deleteInventoryItem);

module.exports = router;
