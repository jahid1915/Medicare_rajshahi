const express = require("express");
const router = express.Router();
const { getHospitals, getHospitalById, getHospitalResources, updateResourceAvailability } = require("../controllers/hospitalController");
const { protect, authorize, ownHospitalOnly } = require("../middleware/auth");

router.get("/",     getHospitals);
router.get("/:id",  getHospitalById);
router.get("/:hospitalId/resources", getHospitalResources);
router.get("/:hospitalId/resources/availability", getHospitalResources);

// Hospital admin or platform admin can update resources
router.patch(
  "/:hospitalId/resources/:resourceId",
  protect,
  authorize("hospital_admin", "hospital_management", "super_admin"),
  ownHospitalOnly,
  updateResourceAvailability
);

module.exports = router;
