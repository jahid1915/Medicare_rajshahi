const Prescription = require("../models/Prescription");
const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

// POST /api/prescriptions
exports.createPrescription = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // If patient is creating an uploaded prescription
    if (req.user.role === "patient") {
      data.patient_id = req.user._id;
      data.source_type = data.source_type || "patient_upload";
      data.is_verified = false;
    } else if (["doctor", "specialist_doctor"].includes(req.user.role)) {
      data.doctor_id = req.user._id;
      data.doctor_name = req.user.name || data.doctor_name || "Attending Physician";
      data.is_verified = true;
      data.source_type = data.source_type || "teleconsultation";
    }

    if (!data.patient_id) {
      data.patient_id = req.user._id;
    }

    // Link to appointment if provided
    if (data.appointment_id) {
      const Appointment = require("../models/Appointment");
      const appt = await Appointment.findById(data.appointment_id);
      if (appt) {
        data.appointment_number = appt.serialNumber || appt.appointmentId || "";
        if (!data.patient_id || data.patient_id.toString() === req.user._id.toString()) {
          data.patient_id = appt.patientId || appt.patient_id || req.user._id;
        }
        // Update appointment status to COMPLETED
        appt.status = "COMPLETED";
        appt.completed_at = new Date();
        if (data.diagnosis) appt.doctor_notes = (appt.doctor_notes ? appt.doctor_notes + "\n" : "") + `Diagnosis: ${data.diagnosis}`;
        await appt.save();

        if (isSupabaseConfigured()) {
          try {
            await supabaseAdmin
              .from("appointments")
              .update({
                status: "COMPLETED",
                completed_at: new Date().toISOString(),
                doctor_notes: appt.doctor_notes
              })
              .or(`id.eq.${appt._id},legacy_mongodb_id.eq.${appt._id},appointment_id.eq.${appt.appointmentId || appt._id}`);
          } catch (sbAptErr) {
            console.warn("⚠️ [Supabase] Appointment status sync warning:", sbAptErr.message);
          }
        }
      }
    }

    const prescription = await Prescription.create(data);

    // Sync to Supabase prescriptions table if configured
    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from("prescriptions").insert({
          legacy_mongodb_id: prescription._id.toString(),
          prescription_number: prescription.prescription_number || `RX-${Date.now().toString().slice(-6)}`,
          patient_id: data.patient_id?.toString(),
          doctor_id: data.doctor_id?.toString() || req.user._id.toString(),
          appointment_id: data.appointment_id?.toString() || null,
          appointment_number: data.appointment_number || "",
          doctor_name: data.doctor_name || req.user.name || "Attending Physician",
          doctor_specialization: data.doctor_specialization || "General Medicine",
          diagnosis: data.diagnosis || "",
          advice: data.advice || "",
          tests_advised: Array.isArray(data.tests_advised) ? data.tests_advised : [],
          created_at: new Date().toISOString()
        });
      } catch (sbRxErr) {
        console.warn("⚠️ [Supabase] Prescription sync warning:", sbRxErr.message);
      }
    }

    return successResponse(res, prescription, "Prescription created successfully", 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/prescriptions/my-prescriptions
exports.getMyPrescriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    let filter = { patient_id: req.user._id };

    if (["doctor", "specialist_doctor"].includes(req.user.role)) {
      const Doctor = require("../models/Doctor");
      const docQuery = [{ user_id: req.user._id || req.user.id }];
      if (req.user.doctor_id) docQuery.push({ _id: req.user.doctor_id });
      if (req.user.name && req.user.name.trim()) {
        docQuery.push({ name: new RegExp("^" + req.user.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") });
      }
      const docProfiles = await Doctor.find({ $or: docQuery }).select("_id");

      const doctorIds = [req.user._id, ...docProfiles.map(d => d._id)];

      filter = {
        $or: [
          { doctor_id: { $in: doctorIds } },
          { patient_id: req.user._id }
        ]
      };
    }

    const total = await Prescription.countDocuments(filter);
    const prescriptions = await Prescription.find(filter)
      .populate("patient_id", "name phone email date_of_birth gender blood_group")
      .populate("doctor_id", "name specialty qualifications imageUrl designation workplace")
      .populate("appointment_id", "serialNumber appointmentDate time_slot consultationFee status")
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

    const isPatient = prescription.patient_id && String(prescription.patient_id._id || prescription.patient_id) === String(req.user.id);

    let isAuthorizedDoctor = false;
    if (["doctor", "specialist_doctor"].includes(req.user.role)) {
      const Doctor = require("../models/Doctor");
      const docQuery = [{ user_id: req.user._id || req.user.id }];
      if (req.user.doctor_id) docQuery.push({ _id: req.user.doctor_id });
      if (req.user.name && req.user.name.trim()) {
        docQuery.push({ name: new RegExp("^" + req.user.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") });
      }
      const docProfiles = await Doctor.find({ $or: docQuery }).select("_id");
      const validDocIds = [req.user.id.toString(), ...docProfiles.map(d => d._id.toString())];
      const rxDocId = (prescription.doctor_id?._id || prescription.doctor_id)?.toString();
      if (rxDocId && validDocIds.includes(rxDocId)) {
        isAuthorizedDoctor = true;
      }
    }

    const isStaffOrPharmacy = ["super_admin", "hospital_admin", "pharmacy_owner", "pharmacist"].includes(req.user.role);

    if (!isPatient && !isAuthorizedDoctor && !isStaffOrPharmacy) {
      return errorResponse(res, "Access denied. You are not authorized to view this prescription.", 403, "FORBIDDEN");
    }

    return successResponse(res, prescription, "Prescription details");
  } catch (err) {
    next(err);
  }
};
