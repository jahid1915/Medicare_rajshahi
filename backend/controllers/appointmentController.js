const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Order = require("../models/Order");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

// POST /api/appointments
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      doctor_id, facility_id, appointment_date, time_slot,
      consultation_type, patient_name, patient_phone, symptoms, family_member_name
    } = req.body;

    const doctor = await Doctor.findById(doctor_id);
    if (!doctor) return errorResponse(res, "Doctor not found", 404);

    // Create order first
    const order = await Order.create({
      patient_id:   req.user.id,
      provider_id:  doctor.user_id,
      order_type:   "doctor_appointment",
      items: [{
        service_type: "consultation",
        description:  `Consultation with ${doctor.name}`,
        quantity: 1,
        unit_price: doctor.consultation_fee,
        total: doctor.consultation_fee
      }],
      subtotal:     doctor.consultation_fee,
      platform_fee: Math.round(doctor.consultation_fee * 0.025),
      total_amount: doctor.consultation_fee + Math.round(doctor.consultation_fee * 0.025)
    });

    // Create appointment referencing the order
    const appointment = await Appointment.create({
      patient_id: req.user.id,
      doctor_id,
      facility_id,
      appointment_date: new Date(appointment_date),
      time_slot,
      consultation_type: consultation_type || "in_person",
      consultation_fee:  doctor.consultation_fee,
      order_id: order._id,
      patient_name,
      patient_phone,
      family_member_name,
      symptoms,
      status: "awaiting_payment"
    });

    // Link order to appointment
    order.service_reference_id = appointment._id;
    await order.save();

    return successResponse(res, { appointment, order }, "Appointment created. Proceed to payment.", 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/:id
exports.getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate("doctor_id", "name specialization")
      .populate("order_id");
    if (!appt) return errorResponse(res, "Appointment not found", 404);
    if (appt.patient_id.toString() !== req.user.id && req.user.role !== "platform_admin")
      return errorResponse(res, "Access denied", 403, "FORBIDDEN");
    return successResponse(res, appt);
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments (patient sees own appointments)
exports.getMyAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { patient_id: req.user.id };
    if (status) filter.status = status;
    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate("doctor_id", "name specialization avatar")
      .sort({ appointment_date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    return paginatedResponse(res, appointments, total, page, limit);
  } catch (err) {
    next(err);
  }
};
