const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getPharmacyOrders,
  getOrderById,
  updateOrderStatus,
  verifyPrescription,
  cancelOrder
} = require("../controllers/pharmacyOrderController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect); // All pharmacy order endpoints require authentication

// Patient routes
router.post("/", createOrder);
router.get("/my-orders", getMyOrders);

// Pharmacy admin routes
router.get("/pharmacy/:pharmacyId", authorize("pharmacy_owner", "pharmacist", "super_admin"), getPharmacyOrders);
router.patch("/:id/status", authorize("pharmacy_owner", "pharmacist", "super_admin"), updateOrderStatus);
router.patch("/:id/verify-prescription", authorize("pharmacy_owner", "pharmacist", "super_admin"), verifyPrescription);

// Shared
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
