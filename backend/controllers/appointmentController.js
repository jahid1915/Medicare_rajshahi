const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const DoctorBranch = require("../models/DoctorBranch");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { generateAppointmentPdf } = require("../services/pdfService");
const { sendAppointmentConfirmationEmail } = require("../services/emailService");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

/**
 * POST /api/appointments
 * Create a PENDING_PAYMENT appointment with temporary slot hold (15 mins)
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      doctorId,
      doctor_id,
      branchId,
      branch_id,
      appointmentDate,
      appointment_date,
      timeSlot,
      time_slot,
      consultationType,
      consultation_type,
      patientName,
      patientPhone,
      patientEmail,
      gender,
      age,
      address,
      emergencyContact,
      bloodGroup,
      consultationReason,
      symptoms,
      patientDetails
    } = req.body;

    const docId = doctorId || doctor_id;
    const brId = branchId || branch_id;
    const dateStr = appointmentDate || appointment_date;
    const slot = timeSlot || time_slot || req.body.startTime || req.body.time;

    if (!docId || !dateStr || !slot) {
      return errorResponse(res, "Doctor, appointment date, and time slot are required", 422);
    }

    // Resolve Doctor
    let doctor = null;
    if (docId.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(docId);
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ slug: docId.toLowerCase() });
    }
    if (!doctor) return errorResponse(res, "Doctor not found", 404);

    // Resolve Branch
    let branch = null;
    if (brId) {
      branch = await DoctorBranch.findById(brId);
    }
    if (!branch) {
      // Fallback: look for doctor's first active branch or create one
      branch = await DoctorBranch.findOne({ doctorId: doctor._id, active: true });
    }

    const startOfDay = new Date(dateStr);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Check Slot Availability (Zero double booking)
    const existingBooking = await Appointment.findOne({
      $or: [
        { doctorId: doctor._id },
        { doctor_id: doctor._id }
      ],
      $and: [
        {
          $or: [
            { appointmentDate: { $gte: startOfDay, $lte: endOfDay } },
            { appointment_date: { $gte: startOfDay, $lte: endOfDay } }
          ]
        },
        {
          $or: [
            { time_slot: slot.trim() },
            { startTime: slot.trim() }
          ]
        },
        {
          status: {
            $in: ["CONFIRMED", "confirmed", "PENDING_PAYMENT", "awaiting_payment"]
          }
        }
      ]
    });

    const now = new Date();
    if (existingBooking) {
      // Check if temporary hold expired
      const isHold = existingBooking.status === "PENDING_PAYMENT" || existingBooking.status === "awaiting_payment";
      if (isHold && existingBooking.holdExpiresAt && now > new Date(existingBooking.holdExpiresAt)) {
        // Expired hold: release slot
        existingBooking.status = "EXPIRED";
        existingBooking.paymentStatus = "FAILED";
        await existingBooking.save();
      } else {
        return errorResponse(
          res,
          "The selected time slot has already been reserved or booked. Please choose another time slot.",
          409,
          "SLOT_UNAVAILABLE"
        );
      }
    }

    // Determine consultation fee from DB (Never trust frontend amount)
    const fee = (branch && branch.consultationFee) || doctor.consultation_fee || 800;

    // Temporary payment hold: 15 minutes
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const appointment = await Appointment.create({
      patientId: req.user.id,
      patient_id: req.user.id,
      doctorId: doctor._id,
      doctor_id: doctor._id,
      branchId: branch ? branch._id : undefined,
      branch_id: branch ? branch._id : undefined,
      appointmentDate: new Date(dateStr),
      appointment_date: new Date(dateStr),
      time_slot: slot.trim(),
      startTime: slot.trim(),
      appointmentType: req.body.appointmentType || consultationType || consultation_type || "Online Consultation",
      consultationFee: fee,
      consultation_fee: fee,
      currency: "BDT",
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      holdExpiresAt,
      patientName: patientName || patientDetails?.fullName || patientDetails?.name || req.user.name,
      patientPhone: patientPhone || patientDetails?.phone || req.user.phone,
      patientEmail: patientEmail || patientDetails?.email || req.user.email,
      gender: gender || patientDetails?.gender || req.user.gender,
      age: age || patientDetails?.age || "",
      address: address || patientDetails?.address || req.user.address,
      emergencyContact: emergencyContact || patientDetails?.emergencyContact || req.user.emergency_contact,
      bloodGroup: bloodGroup || patientDetails?.bloodGroup || req.user.blood_group,
      consultationReason: consultationReason || symptoms || "",
      emailDeliveryStatus: "PENDING"
    });

    const populated = await Appointment.findById(appointment._id)
      .populate("doctorId", "name specialty qualifications imageUrl designation")
      .populate("branchId", "name address phone consultationFee");

    return successResponse(res, {
      appointment: populated,
      holdExpiresAt,
      fee,
      currency: "BDT",
      message: "Pending appointment created. Slot held for 15 minutes. Proceed to payment."
    }, "Pending appointment created", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments/my
 * Patient views their own appointments with populated doctor, branch, and payment details
 */
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, date, upcoming, doctorId } = req.query;

    let filter = {};
    const isDoctor = ["doctor", "specialist_doctor"].includes(req.user.role);
    const isAdmin = ["super_admin", "hospital_admin"].includes(req.user.role);

    if (isDoctor) {
      const Doctor = require("../models/Doctor");
      const docQuery = [{ user_id: req.user._id || req.user.id }];
      if (req.user.doctor_id) docQuery.push({ _id: req.user.doctor_id });
      if (req.user.name && req.user.name.trim()) {
        docQuery.push({ name: new RegExp("^" + req.user.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") });
      }
      const docProfiles = await Doctor.find({ $or: docQuery }).select("_id");

      const doctorIds = [req.user._id || req.user.id, ...docProfiles.map(d => d._id)];
      if (doctorId && isAdmin) {
        doctorIds.push(doctorId);
      }

      filter = {
        $or: [
          { doctorId: { $in: doctorIds } },
          { doctor_id: { $in: doctorIds } }
        ]
      };
    } else if (isAdmin && doctorId) {
      filter = {
        $or: [
          { doctorId: doctorId },
          { doctor_id: doctorId }
        ]
      };
    } else {
      filter = {
        $or: [
          { patientId: req.user.id },
          { patient_id: req.user.id }
        ]
      };

      if (req.user.email) {
        filter.$or.push({ patientEmail: req.user.email });
        filter.$or.push({ patientEmail: req.user.email.toLowerCase() });
      }
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (upcoming === "true") {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      filter.appointmentDate = { $gte: now };
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name specialty qualifications imageUrl designation workplace")
      .populate("doctor_id", "name specialty qualifications imageUrl designation workplace")
      .populate("branchId", "name address city phone roomNumber")
      .populate("branch_id", "name address city phone roomNumber")
      .populate("paymentId", "amount status transaction_id payment_number paid_at")
      .populate("patientId", "name phone email date_of_birth gender blood_group allergies existing_conditions medical_history emergency_contact_phone")
      .sort({ appointmentDate: -1, createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    return paginatedResponse(res, appointments, total, parseInt(page), parseInt(limit), "Appointments retrieved");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments/:id
 */
exports.getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate("doctorId", "name specialty qualifications imageUrl designation workplace bmdcRegistration")
      .populate("doctor_id", "name specialty qualifications imageUrl designation workplace bmdcRegistration")
      .populate("branchId", "name address city phone roomNumber")
      .populate("branch_id", "name address city phone roomNumber")
      .populate("paymentId")
      .populate("patientId", "name email phone");

    if (!appt) return errorResponse(res, "Appointment not found", 404);

    const isPatient = (appt.patientId && appt.patientId._id.toString() === req.user.id) ||
                      (appt.patient_id && appt.patient_id.toString() === req.user.id) ||
                      (appt.patientEmail && req.user.email && appt.patientEmail.toLowerCase() === req.user.email.toLowerCase());

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
      const apptDocId = (appt.doctorId?._id || appt.doctorId || appt.doctor_id?._id || appt.doctor_id)?.toString();
      if (apptDocId && validDocIds.includes(apptDocId)) {
        isAuthorizedDoctor = true;
      }
    }

    const isAdmin = ["super_admin", "hospital_admin"].includes(req.user.role);

    if (!isPatient && !isAuthorizedDoctor && !isAdmin) {
      return errorResponse(res, "Access denied. You are not authorized to view this appointment.", 403, "FORBIDDEN");
    }

    return successResponse(res, appt, "Appointment details fetched");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments/:id/pdf
 * Stream or download the official appointment confirmation voucher PDF
 */
exports.getAppointmentPdf = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate("doctorId")
      .populate("doctor_id")
      .populate("branchId")
      .populate("branch_id")
      .populate("paymentId")
      .populate("patientId");

    if (!appt) return errorResponse(res, "Appointment not found", 404);

    const isPatient = (appt.patientId && appt.patientId._id.toString() === req.user.id) ||
                      (appt.patient_id && appt.patient_id.toString() === req.user.id) ||
                      (appt.patientEmail && req.user.email && appt.patientEmail.toLowerCase() === req.user.email.toLowerCase());

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
      const apptDocId = (appt.doctorId?._id || appt.doctorId || appt.doctor_id?._id || appt.doctor_id)?.toString();
      if (apptDocId && validDocIds.includes(apptDocId)) {
        isAuthorizedDoctor = true;
      }
    }

    const isAdmin = ["super_admin", "hospital_admin"].includes(req.user.role);

    if (!isPatient && !isAuthorizedDoctor && !isAdmin) {
      return errorResponse(res, "Access denied to download this appointment voucher", 403, "FORBIDDEN");
    }

    const doctor = appt.doctorId || appt.doctor_id;
    const branch = appt.branchId || appt.branch_id;
    const patient = appt.patientId || { name: appt.patientName, email: appt.patientEmail, phone: appt.patientPhone };
    const payment = appt.paymentId;

    const pdfBuffer = await generateAppointmentPdf({
      appointment: appt,
      doctor,
      branch,
      patient,
      payment
    });

    const serial = appt.serialNumber || appt.appointmentId || "Voucher";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Niramoy-Appointment-${serial}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/appointments/:id/resend-email
 */
exports.resendConfirmationEmail = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate("doctorId")
      .populate("doctor_id")
      .populate("branchId")
      .populate("branch_id")
      .populate("paymentId")
      .populate("patientId");

    if (!appt) return errorResponse(res, "Appointment not found", 404);

    const isPatient = (appt.patientId && appt.patientId._id.toString() === req.user.id) ||
                      (appt.patient_id && appt.patient_id.toString() === req.user.id);
    const isStaff = ["doctor", "super_admin"].includes(req.user.role);

    if (!isPatient && !isStaff) {
      return errorResponse(res, "Access denied", 403);
    }

    const doctor = appt.doctorId || appt.doctor_id;
    const branch = appt.branchId || appt.branch_id;
    const patient = appt.patientId || { name: appt.patientName, email: appt.patientEmail, phone: appt.patientPhone };
    const payment = appt.paymentId;

    const pdfBuffer = await generateAppointmentPdf({
      appointment: appt,
      doctor,
      branch,
      patient,
      payment
    });

    const sendResult = await sendAppointmentConfirmationEmail({
      appointment: appt,
      payment,
      pdfBuffer
    });

    if (sendResult.success) {
      appt.emailDeliveryStatus = "SENT";
      await appt.save();
      return successResponse(res, { emailSent: true }, "Confirmation email re-dispatched successfully");
    } else {
      appt.emailDeliveryStatus = "FAILED";
      await appt.save();
      return successResponse(res, { emailSent: false, error: sendResult.error }, "Email delivery logged");
    }
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/appointments/:id/cancel
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { cancel_reason } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return errorResponse(res, "Appointment not found", 404);

    const isPatient = (appt.patientId && appt.patientId.toString() === req.user.id) ||
                      (appt.patient_id && appt.patient_id.toString() === req.user.id);
    const isStaff = ["doctor", "super_admin"].includes(req.user.role);

    if (!isPatient && !isStaff) return errorResponse(res, "Access denied", 403);

    appt.status = "CANCELLED";
    appt.cancelled_at = new Date();
    appt.cancel_reason = cancel_reason || "Cancelled by patient";
    await appt.save();

    return successResponse(res, appt, "Appointment cancelled successfully. Time slot released.");
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/appointments/:id/status
 * Doctor or Admin updates appointment status, notes, or marks completed
 */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, doctor_notes, symptoms, ai_triage_summary } = req.body;
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return errorResponse(res, "Appointment not found", 404);

    const isDoctor = ["doctor", "specialist_doctor"].includes(req.user.role);
    const isAdmin = ["super_admin", "hospital_admin"].includes(req.user.role);

    if (!isDoctor && !isAdmin) {
      return errorResponse(res, "Access denied. Only attending physicians or administrators can update appointment clinical state.", 403);
    }

    if (status) {
      appt.status = status;
      if (status === "COMPLETED") {
        appt.completed_at = new Date();
      }
    }
    if (doctor_notes !== undefined) appt.doctor_notes = doctor_notes;
    if (symptoms !== undefined) appt.symptoms = symptoms;
    if (ai_triage_summary !== undefined) appt.ai_triage_summary = ai_triage_summary;

    await appt.save();
    return successResponse(res, appt, "Appointment status and clinical record updated successfully");
  } catch (err) {
    next(err);
  }
};

