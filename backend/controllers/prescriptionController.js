const Prescription = require("../models/Prescription");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

// POST /api/prescriptions
exports.createPrescription = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // If patient is creating an uploaded prescription
    if (req.user.role === "patient") {
      data.patient_id = req.user._id;
      data.source_type = "patient_upload";
      data.is_verified = false;
    } else if (["doctor", "specialist_doctor"].includes(req.user.role)) {
      data.doctor_id = req.user._id;
      data.doctor_name = req.user.name;
      data.is_verified = true;
      data.source_type = "teleconsultation";
    }

    if (!data.patient_id) {
      data.patient_id = req.user._id;
    }

    const prescription = await Prescription.create(data);
    return successResponse(res, prescription, "Prescription created successfully", 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/prescriptions/my-prescriptions
exports.getMyPrescriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { patient_id: req.user._id };

    const total = await Prescription.countDocuments(filter);
    const prescriptions = await Prescription.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, prescriptions, total, page, limit, "Prescriptions retrieved");
  } catch (err) {
    next(err);
  }
};

// GET /api/prescriptions/:id
exports.getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patient_id", "name email mobile phone")
      .populate("doctor_id", "name specialization hospital_id");

    if (!prescription) return errorResponse(res, "Prescription not found", 404);
    return successResponse(res, prescription, "Prescription details");
  } catch (err) {
    next(err);
  }
};
