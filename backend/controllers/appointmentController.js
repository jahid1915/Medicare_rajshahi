const crypto = require("crypto");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const DoctorBranch = require("../models/DoctorBranch");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");
const { generateAppointmentPdf } = require("../services/pdfService");
const { sendOtpEmail, sendAppointmentConfirmationEmail } = require("../services/emailService");
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
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    // 1. SUPABASE POSTGRESQL (AUTHORITATIVE SOURCE OF TRUTH)
    if (isSupabaseConfigured()) {
      try {
        let sbQuery = supabaseAdmin
          .from("appointments")
          .select("*, doctors(name, specialty, qualifications, image_url, workplace), doctor_branches(name, address, city, room_number)", { count: "exact" });

        const isDoctor = ["doctor", "specialist_doctor"].includes(req.user.role);
        const isAdmin = ["super_admin", "hospital_admin"].includes(req.user.role);

        if (isDoctor) {
          const docId = req.user.doctor_id || req.user.id || req.user._id;
          sbQuery = sbQuery.eq("doctor_id", docId);
        } else if (isAdmin && doctorId) {
          sbQuery = sbQuery.eq("doctor_id", doctorId);
        } else {
          // Patient query: match by patient_id or email
          const userEmail = (req.user.email || "").trim().toLowerCase();
          const userId = req.user.id || req.user._id;
          if (userEmail && userId) {
            sbQuery = sbQuery.or(`patient_id.eq.${userId},patient_email.ilike.${userEmail}`);
          } else if (userEmail) {
            sbQuery = sbQuery.ilike("patient_email", userEmail);
          } else if (userId) {
            sbQuery = sbQuery.eq("patient_id", userId);
          }
        }

        if (status && status !== "all") {
          sbQuery = sbQuery.eq("status", status.toUpperCase());
        }

        if (date) {
          sbQuery = sbQuery.eq("appointment_date", date);
        } else if (upcoming === "true") {
          const todayStr = new Date().toISOString().split("T")[0];
          sbQuery = sbQuery.gte("appointment_date", todayStr);
        }

        const offset = (pageNum - 1) * limitNum;
        sbQuery = sbQuery
          .order("appointment_date", { ascending: false })
          .order("created_at", { ascending: false })
          .range(offset, offset + limitNum - 1);

        const { data: sbAppts, error: sbError, count } = await sbQuery;

        if (!sbError && sbAppts && sbAppts.length > 0) {
          const formatted = sbAppts.map(a => ({
            _id: a.id,
            id: a.id,
            appointmentId: a.appointment_id,
            serialNumber: a.serial_number,
            appointmentDate: a.appointment_date,
            appointmentTime: a.time_slot || a.start_time,
            status: a.status,
            paymentStatus: a.payment_status,
            consultationFee: a.consultation_fee,
            patientName: a.patient_name,
            patientPhone: a.patient_phone,
            patientEmail: a.patient_email,
            emailDeliveryStatus: a.email_delivery_status,
            pdfUrl: `/api/appointments/${a.id}/pdf`,
            createdAt: a.created_at,
            doctorId: a.doctors ? {
              _id: a.doctor_id,
              id: a.doctor_id,
              name: a.doctors.name,
              specialty: a.doctors.specialty,
              qualifications: a.doctors.qualifications,
              imageUrl: a.doctors.image_url,
              workplace: a.doctors.workplace
            } : null,
            branchId: a.doctor_branches ? {
              _id: a.branch_id,
              id: a.branch_id,
              name: a.doctor_branches.name,
              address: a.doctor_branches.address,
              city: a.doctor_branches.city,
              roomNumber: a.doctor_branches.room_number
            } : null
          }));

          return paginatedResponse(res, formatted, count || formatted.length, pageNum, limitNum, "Appointments retrieved from Supabase (Source of Truth)");
        }
      } catch (sbErr) {
        console.warn("⚠️ [Supabase] Error querying appointments, falling back to legacy MongoDB:", sbErr.message);
      }
    }

    // 2. Fallback to MongoDB for legacy records
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
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return paginatedResponse(res, appointments, total, pageNum, limitNum, "Appointments retrieved");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments/:id
 */
exports.getAppointment = async (req, res, next) => {
  try {
    const paramId = req.params.id;

    // 1. SUPABASE POSTGRESQL (AUTHORITATIVE SOURCE OF TRUTH)
    if (isSupabaseConfigured()) {
      try {
        const isUuid = paramId && paramId.match(/^[0-9a-fA-F-]{36}$/);
        let query = supabaseAdmin
          .from("appointments")
          .select("*, doctors(name, specialty, qualifications, image_url, workplace, bmdc_registration), doctor_branches(name, address, city, room_number)");

        if (isUuid) {
          query = query.eq("id", paramId);
        } else {
          query = query.or(`appointment_id.eq.${paramId},legacy_mongodb_id.eq.${paramId}`);
        }

        const { data: sbAppt, error: sbError } = await query.maybeSingle();

        if (!sbError && sbAppt) {
          const isPatient = (sbAppt.patient_id === req.user.id) ||
                            (sbAppt.patient_email && req.user.email && sbAppt.patient_email.toLowerCase() === req.user.email.toLowerCase());

          const isAuthorizedDoctor = ["doctor", "specialist_doctor"].includes(req.user.role) &&
                                     (sbAppt.doctor_id === req.user.doctor_id || sbAppt.doctor_id === req.user.id);

          const isAdmin = ["super_admin", "hospital_admin"].includes(req.user.role);

          if (!isPatient && !isAuthorizedDoctor && !isAdmin) {
            return errorResponse(res, "Access denied. You are not authorized to view this appointment.", 403, "FORBIDDEN");
          }

          const formatted = {
            _id: sbAppt.id,
            id: sbAppt.id,
            appointmentId: sbAppt.appointment_id,
            serialNumber: sbAppt.serial_number,
            appointmentDate: sbAppt.appointment_date,
            appointmentTime: sbAppt.time_slot || sbAppt.start_time,
            status: sbAppt.status,
            paymentStatus: sbAppt.payment_status,
            consultationFee: sbAppt.consultation_fee,
            patientName: sbAppt.patient_name,
            patientPhone: sbAppt.patient_phone,
            patientEmail: sbAppt.patient_email,
            emailDeliveryStatus: sbAppt.email_delivery_status,
            pdfUrl: `/api/appointments/${sbAppt.id}/pdf`,
            createdAt: sbAppt.created_at,
            doctorId: sbAppt.doctors ? {
              _id: sbAppt.doctor_id,
              name: sbAppt.doctors.name,
              specialty: sbAppt.doctors.specialty,
              qualifications: sbAppt.doctors.qualifications,
              imageUrl: sbAppt.doctors.image_url,
              workplace: sbAppt.doctors.workplace,
              bmdcRegistration: sbAppt.doctors.bmdc_registration
            } : null,
            branchId: sbAppt.doctor_branches ? {
              _id: sbAppt.branch_id,
              name: sbAppt.doctor_branches.name,
              address: sbAppt.doctor_branches.address,
              city: sbAppt.doctor_branches.city,
              roomNumber: sbAppt.doctor_branches.room_number
            } : null
          };

          return successResponse(res, formatted, "Appointment details fetched from Supabase");
        }
      } catch (sbErr) {
        console.warn("⚠️ [Supabase] Error fetching single appointment:", sbErr.message);
      }
    }

    // 2. Fallback to MongoDB
    const appt = await Appointment.findById(paramId)
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
 * Prioritizes Supabase PostgreSQL as authoritative source of truth.
 */
exports.getAppointmentPdf = async (req, res, next) => {
  try {
    const paramId = req.params.id;
    let appt = null;
    let doctor = null;
    let branch = null;
    let patient = null;
    let payment = null;

    // 1. Check Supabase PostgreSQL first (AUTHORITATIVE SOURCE OF TRUTH)
    if (isSupabaseConfigured()) {
      const isUuid = paramId && paramId.match(/^[0-9a-fA-F-]{36}$/);
      let query = supabaseAdmin.from("appointments").select("*");
      if (isUuid) {
        query = query.eq("id", paramId);
      } else {
        query = query.or(`appointment_id.eq.${paramId},legacy_mongodb_id.eq.${paramId}`);
      }
      const { data: supaAppts } = await query.limit(1);
      if (supaAppts && supaAppts.length > 0) {
        const sAppt = supaAppts[0];
        appt = {
          ...sAppt,
          serialNumber: sAppt.serial_number,
          appointmentId: sAppt.appointment_id,
          appointmentDate: sAppt.appointment_date,
          time_slot: sAppt.time_slot,
          consultationFee: sAppt.consultation_fee,
          consultationType: sAppt.consultation_type,
          patientName: sAppt.patient_name,
          patientEmail: sAppt.patient_email,
          patientPhone: sAppt.patient_phone,
          address: sAppt.address,
          emergencyContact: sAppt.emergency_contact
        };
        patient = {
          name: sAppt.patient_name,
          email: sAppt.patient_email,
          phone: sAppt.patient_phone
        };

        if (sAppt.doctor_id) {
          const { data: dData } = await supabaseAdmin.from("doctors").select("*").eq("id", sAppt.doctor_id).limit(1);
          if (dData && dData.length > 0) doctor = dData[0];
        }
        if (sAppt.branch_id) {
          const { data: bData } = await supabaseAdmin.from("doctor_branches").select("*").eq("id", sAppt.branch_id).limit(1);
          if (bData && bData.length > 0) branch = bData[0];
        }
      }
    }

    // 2. Fallback to MongoDB Legacy backup
    if (!appt) {
      const mongoAppt = await Appointment.findById(paramId)
        .populate("doctorId")
        .populate("doctor_id")
        .populate("branchId")
        .populate("branch_id")
        .populate("paymentId")
        .populate("patientId");
      if (!mongoAppt) return errorResponse(res, "Appointment not found", 404);
      appt = mongoAppt;
      doctor = appt.doctorId || appt.doctor_id;
      branch = appt.branchId || appt.branch_id;
      patient = appt.patientId || { name: appt.patientName, email: appt.patientEmail, phone: appt.patientPhone };
      payment = appt.paymentId;
    }

    const pdfBuffer = await generateAppointmentPdf({
      appointment: appt,
      doctor: doctor || { name: "Specialist Physician", specialty: "Specialist" },
      branch: branch || { name: "Chamber", address: "Rajshahi" },
      patient: patient || { name: appt.patientName || "Patient" },
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

    // Persist status update to Supabase PostgreSQL (authoritative source of truth)
    if (isSupabaseConfigured()) {
      try {
        const sbUpdates = {};
        if (status) {
          sbUpdates.status = status;
          if (status === "COMPLETED") sbUpdates.completed_at = new Date().toISOString();
        }
        if (doctor_notes !== undefined) sbUpdates.doctor_notes = doctor_notes;
        await supabaseAdmin
          .from("appointments")
          .update(sbUpdates)
          .or(`id.eq.${req.params.id},legacy_mongodb_id.eq.${req.params.id},appointment_id.eq.${appt.appointmentId || appt._id}`);
      } catch (sbErr) {
        console.warn("⚠️ [Supabase] Status update error:", sbErr.message);
      }
    }

    return successResponse(res, appt, "Appointment status and clinical record updated successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/appointments/request-email-otp
 * Dispatches 6-digit cryptographic Email OTP stored in Supabase otp_verifications
 * Enforces 10-minute expiry, 60s resend cooldown, and rate limiting
 */
exports.requestBookingEmailOtp = async (req, res, next) => {
  try {
    const {
      email,
      doctorId,
      doctor_id,
      branchId,
      branch_id,
      appointmentDate,
      appointment_date,
      timeSlot,
      time_slot,
      patientName
    } = req.body;

    if (!email || !email.includes("@")) {
      return errorResponse(res, "A valid email address is required to receive your verification code.", 422);
    }

    const cleanEmail = email.trim().toLowerCase();
    const docId = doctorId || doctor_id;
    const brId = branchId || branch_id;
    const dateStr = appointmentDate || appointment_date;
    const slot = timeSlot || time_slot;

    // Check rate limit: 60-second resend cooldown in Supabase (Rule 5)
    if (isSupabaseConfigured()) {
      const { data: recentOtps } = await supabaseAdmin
        .from("otp_verifications")
        .select("created_at, last_resend_at")
        .eq("email", cleanEmail)
        .eq("purpose", "APPOINTMENT_BOOKING")
        .order("created_at", { ascending: false })
        .limit(1);

      if (recentOtps && recentOtps.length > 0) {
        const lastSent = new Date(recentOtps[0].last_resend_at || recentOtps[0].created_at).getTime();
        const diffSeconds = Math.floor((Date.now() - lastSent) / 1000);
        if (diffSeconds < 60) {
          const waitSec = 60 - diffSeconds;
          return errorResponse(
            res,
            `Please wait ${waitSec} second${waitSec === 1 ? "" : "s"} before requesting a new verification code.`,
            429,
            "RATE_LIMITED"
          );
        }
      }

      // Invalidate existing unused appointment OTPs for this email to prevent replay
      await supabaseAdmin
        .from("otp_verifications")
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq("email", cleanEmail)
        .eq("purpose", "APPOINTMENT_BOOKING")
        .eq("verified", false);
    }

    // Generate secure 6-digit cryptographic OTP (100000 - 999999)
    const otp = crypto.randomInt(100000, 999999).toString();
    const otp_hash = crypto.createHash("sha256").update(otp).digest("hex");
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes TTL

    // Store in Supabase PostgreSQL (AUTHORITATIVE SOURCE OF TRUTH - Rule 1 & 5)
    if (isSupabaseConfigured()) {
      await supabaseAdmin.from("otp_verifications").insert({
        email: cleanEmail,
        otp_hash,
        purpose: "APPOINTMENT_BOOKING",
        expires_at: expires_at.toISOString(),
        attempt_count: 0,
        resend_count: 0,
        last_resend_at: new Date().toISOString(),
        verified: false,
        metadata: {
          doctorId: docId,
          branchId: brId,
          appointmentDate: dateStr,
          timeSlot: slot,
          patientName: patientName || "Patient"
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // Dispatch OTP strictly via Email (Rule 4)
    const emailResult = await sendOtpEmail({
      email: cleanEmail,
      otp,
      purpose: `Doctor Appointment Verification (${patientName || "Patient"})`
    });

    return successResponse(
      res,
      {
        email: cleanEmail,
        channel: "email",
        expires_in_seconds: 600,
        resend_cooldown_seconds: 60,
        emailSent: emailResult.success,
        message: `Verification code sent to ${cleanEmail}`
      },
      "Verification code sent to your email"
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/appointments/confirm-with-email-otp
 * Strict Server-Side Verification:
 * 1. Validates 6-digit OTP against Supabase otp_verifications
 * 2. Idempotency check: returns existing record if already confirmed for this client request
 * 3. Atomic Slot Availability check in Supabase appointments
 * 4. Inserts CONFIRMED appointment into Supabase PostgreSQL (Authoritative Source of Truth)
 * 5. Generates official PDF voucher strictly from the confirmed record
 * 6. Dispatches confirmation email with PDF attachment & records delivery state in Supabase
 */
exports.confirmBookingWithEmailOtp = async (req, res, next) => {
  try {
    const {
      email,
      otp,
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
      gender,
      age,
      address,
      emergencyContact,
      bloodGroup,
      consultationReason,
      symptoms,
      booking_request_id,
      idempotency_key
    } = req.body;

    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanOtp = String(otp || "").trim();
    const docId = doctorId || doctor_id;
    const brId = branchId || branch_id;
    const dateStr = appointmentDate || appointment_date;
    const slot = (timeSlot || time_slot || "").trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return errorResponse(res, "A valid email address is required.", 422);
    }
    if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
      return errorResponse(res, "Please provide the valid 6-digit verification code.", 422, "INVALID_FORMAT");
    }
    if (!docId || !dateStr || !slot) {
      return errorResponse(res, "Doctor, appointment date, and time slot are required.", 422);
    }
    if (!patientName || !patientName.trim()) {
      return errorResponse(res, "Patient name is required.", 422);
    }

    // ── 1. VERIFY OTP AGAINST SUPABASE POSTGRESQL ────────────────────────
    let otpRecord = null;
    if (isSupabaseConfigured()) {
      const { data: records, error: otpErr } = await supabaseAdmin
        .from("otp_verifications")
        .select("*")
        .eq("email", cleanEmail)
        .eq("purpose", "APPOINTMENT_BOOKING")
        .eq("verified", false)
        .order("created_at", { ascending: false })
        .limit(1);

      if (otpErr || !records || records.length === 0) {
        return errorResponse(res, "No active verification code found for this email. Please request a new code.", 400, "NO_ACTIVE_OTP");
      }
      otpRecord = records[0];
    }

    if (!otpRecord) {
      return errorResponse(res, "Verification server unavailable.", 503);
    }

    // Check expiration (10 minutes)
    if (new Date() > new Date(otpRecord.expires_at)) {
      return errorResponse(res, "Verification code has expired. Please request a new code.", 400, "EXPIRED_OTP");
    }

    // Check attempt limits (max 5)
    if (otpRecord.attempt_count >= 5) {
      return errorResponse(res, "Maximum verification attempts exceeded. Please request a fresh code.", 429, "MAX_ATTEMPTS_EXCEEDED");
    }

    // Validate SHA-256 hash server-side
    const inputHash = crypto.createHash("sha256").update(cleanOtp).digest("hex");
    if (inputHash !== otpRecord.otp_hash) {
      const newAttempts = (otpRecord.attempt_count || 0) + 1;
      await supabaseAdmin
        .from("otp_verifications")
        .update({ attempt_count: newAttempts, updated_at: new Date().toISOString() })
        .eq("id", otpRecord.id);

      const remaining = 5 - newAttempts;
      return errorResponse(
        res,
        `Incorrect verification code. ${remaining > 0 ? remaining : 0} attempt${remaining === 1 ? "" : "s"} remaining.`,
        400,
        "INVALID_OTP"
      );
    }

    // Mark OTP as verified
    await supabaseAdmin
      .from("otp_verifications")
      .update({ verified: true, updated_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    // ── 2. RESOLVE DOCTOR & BRANCH IN SUPABASE ─────────────────────────
    let supabaseDoctor = null;
    let resolvedDocUUID = null;

    const isDocUuid = docId && /^[0-9a-fA-F-]{36}$/.test(docId);
    let docQuery = supabaseAdmin.from("doctors").select("*");
    if (isDocUuid) {
      docQuery = docQuery.eq("id", docId);
    } else {
      docQuery = docQuery.or(`legacy_mongodb_id.eq.${docId},slug.eq.${docId.toLowerCase()}`);
    }
    const { data: docData } = await docQuery.limit(1);

    if (docData && docData.length > 0) {
      supabaseDoctor = docData[0];
      resolvedDocUUID = supabaseDoctor.id;
    } else {
      // Fallback: check Mongo to resolve legacy ID
      const mongoDoc = await Doctor.findOne({ $or: [{ _id: docId.match(/^[0-9a-fA-F]{24}$/) ? docId : null }, { slug: docId.toLowerCase() }].filter(Boolean) });
      if (mongoDoc) {
        const { data: docByLegacy } = await supabaseAdmin
          .from("doctors")
          .select("*")
          .eq("legacy_mongodb_id", mongoDoc._id.toString())
          .limit(1);
        if (docByLegacy && docByLegacy.length > 0) {
          supabaseDoctor = docByLegacy[0];
          resolvedDocUUID = supabaseDoctor.id;
        }
      }
    }

    if (!supabaseDoctor) {
      return errorResponse(res, "Doctor not found in authoritative database", 404);
    }

    // Resolve Branch in Supabase
    let supabaseBranch = null;
    let resolvedBranchUUID = null;
    if (brId) {
      const isBrUuid = /^[0-9a-fA-F-]{36}$/.test(brId);
      let brQuery = supabaseAdmin.from("doctor_branches").select("*");
      if (isBrUuid) {
        brQuery = brQuery.eq("id", brId);
      } else {
        brQuery = brQuery.eq("legacy_mongodb_id", brId);
      }
      const { data: brData } = await brQuery.limit(1);
      if (brData && brData.length > 0) {
        supabaseBranch = brData[0];
        resolvedBranchUUID = supabaseBranch.id;
      }
    }

    if (!supabaseBranch) {
      const { data: brList } = await supabaseAdmin
        .from("doctor_branches")
        .select("*")
        .eq("doctor_id", resolvedDocUUID)
        .eq("active", true)
        .limit(1);
      if (brList && brList.length > 0) {
        supabaseBranch = brList[0];
        resolvedBranchUUID = supabaseBranch.id;
      }
    }

    // ── 3. IDEMPOTENCY CHECK (Rule 11) ─────────────────────────────────
    const { data: existingAppts } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .eq("doctor_id", resolvedDocUUID)
      .eq("appointment_date", dateStr)
      .eq("patient_email", cleanEmail)
      .in("status", ["CONFIRMED", "confirmed"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingAppts && existingAppts.length > 0) {
      const existing = existingAppts[0];
      const timeDiffMinutes = (Date.now() - new Date(existing.created_at).getTime()) / (1000 * 60);
      if (timeDiffMinutes < 10) {
        return successResponse(
          res,
          {
            appointment: existing,
            serialNumber: existing.serial_number,
            pdfDownloadUrl: `/api/appointments/${existing.id}/pdf`,
            status: "CONFIRMED",
            idempotentReplay: true
          },
          "Appointment confirmed"
        );
      }
    }

    // ── 4. ATOMIC SLOT AVAILABILITY CHECK IN SUPABASE (Rule 6) ───────────
    const { data: slotConflict } = await supabaseAdmin
      .from("appointments")
      .select("id, serial_number, status")
      .eq("doctor_id", resolvedDocUUID)
      .eq("appointment_date", dateStr)
      .or(`time_slot.eq.${slot},start_time.eq.${slot}`)
      .in("status", ["CONFIRMED", "confirmed", "PENDING_PAYMENT", "awaiting_payment"]);

    if (slotConflict && slotConflict.length > 0) {
      return errorResponse(
        res,
        "This appointment slot was just booked by another patient.\n\nPlease select another available time.",
        409,
        "SLOT_ALREADY_BOOKED"
      );
    }

    // ── 5. RESOLVE PATIENT PROFILE IN SUPABASE (profiles table) ─────────
    let patientProfileId = req.user?.id && /^[0-9a-fA-F-]{36}$/.test(req.user.id) ? req.user.id : null;
    if (!patientProfileId) {
      const { data: existingProf } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .limit(1);

      if (existingProf && existingProf.length > 0) {
        patientProfileId = existingProf[0].id;
      } else {
        const { data: newProf, error: profErr } = await supabaseAdmin
          .from("profiles")
          .insert({
            name: patientName.trim(),
            email: cleanEmail,
            phone: patientPhone ? patientPhone.trim() : null,
            role: "patient",
            gender: gender || "male",
            address: address || "Rajshahi, Bangladesh",
            emergency_contact: emergencyContact || null,
            blood_group: bloodGroup || null,
            is_verified: true,
            is_email_verified: true,
            is_active: true
          })
          .select("id")
          .single();

        if (newProf) {
          patientProfileId = newProf.id;
        } else if (profErr) {
          console.warn("[Profile Auto-Create Warning]:", profErr.message);
        }
      }
    }

    // ── 6. CREATE CONFIRMED APPOINTMENT IN SUPABASE (Rule 1 & Rule 7) ────
    const serialNumber = `NRM-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const appointmentId = `APT-${Date.now()}`;
    const fee = supabaseBranch?.consultation_fee || supabaseDoctor?.consultation_fee || 800;

    const newApptRecord = {
      appointment_id: appointmentId,
      serial_number: serialNumber,
      patient_id: patientProfileId,
      doctor_id: resolvedDocUUID,
      branch_id: resolvedBranchUUID || null,
      appointment_date: dateStr,
      time_slot: slot,
      start_time: slot,
      appointment_type: "chamber",
      consultation_type: consultationType || consultation_type || "In-person Consultation",
      consultation_fee: fee,
      currency: "BDT",
      status: "CONFIRMED",
      payment_status: "UNPAID",
      patient_name: patientName.trim(),
      patient_email: cleanEmail,
      patient_phone: patientPhone ? patientPhone.trim() : null,
      gender: gender || "male",
      age: age ? parseInt(age) : null,
      address: address || "Rajshahi, Bangladesh",
      emergency_contact: emergencyContact || null,
      blood_group: bloodGroup || null,
      consultation_reason: consultationReason || null,
      symptoms: symptoms || null,
      email_delivery_status: "PENDING",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: insertedAppt, error: insertErr } = await supabaseAdmin
      .from("appointments")
      .insert(newApptRecord)
      .select("*")
      .single();

    if (insertErr || !insertedAppt) {
      if (insertErr && (insertErr.code === "23505" || insertErr.message?.includes("duplicate key") || insertErr.message?.includes("uq_active_appointment_slot"))) {
        return errorResponse(
          res,
          "This appointment slot was just booked by another patient.\n\nPlease select another available time.",
          409,
          "SLOT_ALREADY_BOOKED"
        );
      }
      console.error("[Appointment Confirmation Error]:", insertErr);
      return errorResponse(res, "Failed to confirm appointment in authoritative database", 500);
    }

    // ── 6. GENERATE PDF VOUCHER STRICTLY FROM CONFIRMED RECORD (Rule 9) ───
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateAppointmentPdf({
        appointment: {
          ...insertedAppt,
          serialNumber: insertedAppt.serial_number,
          appointmentId: insertedAppt.appointment_id,
          appointmentDate: insertedAppt.appointment_date,
          time_slot: insertedAppt.time_slot,
          consultationFee: insertedAppt.consultation_fee,
          consultationType: insertedAppt.consultation_type,
          patientName: insertedAppt.patient_name,
          patientEmail: insertedAppt.patient_email,
          patientPhone: insertedAppt.patient_phone,
          address: insertedAppt.address,
          emergencyContact: insertedAppt.emergency_contact
        },
        doctor: supabaseDoctor,
        branch: supabaseBranch || {
          name: supabaseDoctor.workplace || "Rajshahi Medical Chamber",
          address: "Laxmipur, Rajshahi",
          phone: "01711223344"
        },
        patient: {
          name: insertedAppt.patient_name,
          email: insertedAppt.patient_email,
          phone: insertedAppt.patient_phone
        },
        payment: null
      });
    } catch (pdfErr) {
      console.error("[PDF Generation Warning]:", pdfErr.message);
    }

    // ── 7. EMAIL CONFIRMATION WITH PDF ATTACHMENT (Rule 10) ──────────────
    let emailSuccess = false;
    if (pdfBuffer) {
      try {
        const sendResult = await sendAppointmentConfirmationEmail({
          appointment: {
            ...insertedAppt,
            patientEmail: cleanEmail,
            serialNumber: serialNumber,
            appointmentId: appointmentId,
            doctorName: supabaseDoctor.name,
            specialty: supabaseDoctor.specialty,
            branchName: supabaseBranch?.name || supabaseDoctor.workplace || "Chamber",
            appointmentDate: dateStr,
            time_slot: slot,
            consultationFee: fee
          },
          payment: null,
          pdfBuffer
        });
        emailSuccess = sendResult.success;
      } catch (emErr) {
        console.error("[Email Dispatch Warning]:", emErr.message);
      }

      // Update email delivery status in Supabase (Rule 10)
      await supabaseAdmin
        .from("appointments")
        .update({
          email_delivery_status: emailSuccess ? "SENT" : "FAILED",
          updated_at: new Date().toISOString()
        })
        .eq("id", insertedAppt.id);
    }

    return successResponse(
      res,
      {
        appointment: {
          ...insertedAppt,
          doctor: {
            name: supabaseDoctor.name,
            specialty: supabaseDoctor.specialty,
            designation: supabaseDoctor.designation,
            workplace: supabaseDoctor.workplace
          },
          branch: supabaseBranch
        },
        serialNumber,
        pdfDownloadUrl: `/api/appointments/${insertedAppt.id}/pdf`,
        emailDelivered: emailSuccess,
        status: "CONFIRMED"
      },
      "Appointment confirmed successfully! A confirmation email and PDF voucher have been sent.",
      201
    );
  } catch (err) {
    next(err);
  }
};

