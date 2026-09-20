const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const { successResponse, paginatedResponse, errorResponse } = require("../utils/responseHelper");

router.get("/", async (req, res, next) => {
  try {
    const { specialization, city, verified, page = 1, limit = 20, search } = req.query;
    const filter = { is_active: true };
    if (specialization) filter.specialization = new RegExp(specialization, "i");
    if (city)      filter.city = new RegExp(city, "i");
    if (verified === "true") filter.is_verified = true;
    if (search)    filter.$text = { $search: search };

    const total = await Doctor.countDocuments(filter);
    const doctors = await Doctor.find(filter)
      .populate("hospital_id", "name area")
      .sort({ is_verified: -1, rating: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    return paginatedResponse(res, doctors, total, page, limit);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const doc = await Doctor.findById(req.params.id).populate("hospital_id", "name address area phone");
    if (!doc) return errorResponse(res, "Doctor not found", 404);
    return successResponse(res, doc);
  } catch (err) { next(err); }
});

module.exports = router;
