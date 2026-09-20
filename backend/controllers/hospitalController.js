const Hospital = require("../models/Hospital");
const HospitalResource = require("../models/HospitalResource");
const AuditLog = require("../models/AuditLog");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

// GET /api/hospitals
exports.getHospitals = async (req, res, next) => {
  try {
    const { city, district, type, has_icu, has_emergency, has_blood_bank, area, verified, search, page = 1, limit = 20 } = req.query;

    const filter = { is_active: true };
    if (city)        filter.city = new RegExp(city, "i");
    if (district)    filter.district = new RegExp(district, "i");
    if (type && type !== "all") filter.type = type;
    if (area && area !== "All Areas") filter.area = new RegExp(area, "i");
    if (has_icu === "true")       filter.has_icu = true;
    if (has_emergency === "true") filter.has_emergency = true;
    if (has_blood_bank === "true")filter.has_blood_bank = true;
    if (verified === "true")      filter.is_verified = true;
    if (search)       filter.$text = { $search: search };

    const total = await Hospital.countDocuments(filter);
    const hospitals = await Hospital.find(filter)
      .select("-__v")
      .sort({ is_verified: -1, name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, hospitals, total, page, limit, "Hospitals fetched successfully");
  } catch (err) {
    next(err);
  }
};

// GET /api/hospitals/:id
exports.getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id).select("-__v");
    if (!hospital) return errorResponse(res, "Hospital not found", 404, "NOT_FOUND");
    return successResponse(res, hospital, "Hospital fetched");
  } catch (err) {
    next(err);
  }
};

// GET /api/hospitals/:hospitalId/resources
exports.getHospitalResources = async (req, res, next) => {
  try {
    const resources = await HospitalResource.find({ hospital_id: req.params.hospitalId }).select("-__v");
    return successResponse(res, resources, "Resources fetched");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/hospitals/:hospitalId/resources/:resourceId
exports.updateResourceAvailability = async (req, res, next) => {
  try {
    const { available_count, occupied_count, maintenance_count, notes } = req.body;
    const resource = await HospitalResource.findOne({
      _id: req.params.resourceId,
      hospital_id: req.params.hospitalId
    });
    if (!resource) return errorResponse(res, "Resource not found", 404);

    const oldAvailable = resource.available_count;

    if (available_count != null) resource.available_count = parseInt(available_count);
    if (occupied_count  != null) resource.occupied_count  = parseInt(occupied_count);
    if (maintenance_count != null) resource.maintenance_count = parseInt(maintenance_count);
    resource.last_updated = new Date();
    resource.updated_by = req.user?.id;
    resource.source = "hospital_admin";
    resource.verification_status = "hospital_verified";

    await resource.save(); // Pre-save hook calculates occupancy and status

    // Audit log
    await AuditLog.create({
      actor_id:   req.user?.id,
      actor_role: req.user?.role,
      action: "UPDATE_RESOURCE_AVAILABILITY",
      resource_type: "HospitalResource",
      resource_id: resource._id,
      old_value: oldAvailable,
      new_value: resource.available_count,
      detail: notes || `Updated ${resource.resource_name} availability`
    });

    return successResponse(res, resource, "Resource updated successfully");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/hospitals/:id/verify (platform_admin only)
exports.verifyHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { is_verified: true, verification_level: "verified", verified_at: new Date(), verified_by: req.user?.id },
      { new: true }
    );
    if (!hospital) return errorResponse(res, "Hospital not found", 404);
    return successResponse(res, hospital, "Hospital verified successfully");
  } catch (err) {
    next(err);
  }
};
