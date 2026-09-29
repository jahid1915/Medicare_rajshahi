const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getPharmacies,
  getPharmacyById,
  getMyPharmacy,
  createPharmacy,
  updatePharmacy,
  getPharmacyInventory,
  addInventoryItem,
  deleteInventoryItem,
  importExcelPreview,
  confirmExcelImport,
  exportExcel,
  bulkUpdateStock,
  getPharmacyAnalytics,
  checkPrescriptionAvailability
} = require("../controllers/pharmacyController");
const { protect, authorize, ownPharmacyOnly } = require("../middleware/auth");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ─── Public Routes ───
router.get("/", getPharmacies);
router.get("/availability/by-prescription/:id", checkPrescriptionAvailability);

// ─── Protected Routes (Staff / Pharmacy Owner) ───
router.get("/my-pharmacy",  protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), getMyPharmacy);
router.get("/analytics",    protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), getPharmacyAnalytics);
router.get("/export",       protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), exportExcel);

// Excel Import
router.post("/import/preview", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), upload.single("file"), importExcelPreview);
router.post("/import/confirm", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), confirmExcelImport);
router.post("/import",         protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), upload.single("file"), importExcelPreview);

// Bulk updates
router.post("/inventory/bulk-update", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), bulkUpdateStock);

// Specific Pharmacy Endpoints
router.get("/:id", getPharmacyById);
router.get("/:id/inventory", getPharmacyInventory);

router.post("/",            protect, authorize("pharmacy_owner", "super_admin"), createPharmacy);
router.patch("/:id",        protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), ownPharmacyOnly, updatePharmacy);
router.put("/:id",          protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), ownPharmacyOnly, updatePharmacy);
router.post("/:id/inventory", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), ownPharmacyOnly, addInventoryItem);
router.delete("/:id/inventory/:itemId", protect, authorize("pharmacy_owner", "pharmacist", "super_admin"), ownPharmacyOnly, deleteInventoryItem);

module.exports = router;
