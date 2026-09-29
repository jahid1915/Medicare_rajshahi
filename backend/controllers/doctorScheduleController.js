const Doctor = require("../models/Doctor");
const DoctorBranch = require("../models/DoctorBranch");
const DoctorSchedule = require("../models/DoctorSchedule");
const Appointment = require("../models/Appointment");
const { successResponse, errorResponse } = require("../utils/responseHelper");

/**
 * Generate 20-minute slot labels between start and end times
 */
function generateTimeSlots(startTimeStr = "05:00 PM", endTimeStr = "09:00 PM", durationMinutes = 20) {
  function parseTime(tStr) {
    const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return { hours: 17, minutes: 0 };
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();
    if (meridiem === "PM" && hours < 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  }

  function formatTime(totalMinutes) {
    let hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const meridiem = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    const padH = String(hours).padStart(2, "0");
    const padM = String(minutes).padStart(2, "0");
    return `${padH}:${padM} ${meridiem}`;
  }

  const start = parseTime(startTimeStr);
  const end = parseTime(endTimeStr);

  const startTotal = start.hours * 60 + start.minutes;
  const endTotal = end.hours * 60 + end.minutes;

  const slots = [];
  for (let current = startTotal; current + durationMinutes <= endTotal; current += durationMinutes) {
    slots.push(formatTime(current));
  }

  return slots.length > 0 ? slots : [
    "05:00 PM", "05:20 PM", "05:40 PM",
    "06:00 PM", "06:20 PM", "06:40 PM",
    "07:00 PM", "07:20 PM", "07:40 PM",
    "08:00 PM", "08:20 PM", "08:40 PM"
  ];
}

/**
 * GET /api/doctors/:id/branches
 * Fetches all branches for a doctor, auto-syncing from chambers if not yet created in DoctorBranch
 */
exports.getDoctorBranches = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Resolve doctor by ID or Slug
    let doctor = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id);
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ slug: id.toLowerCase() });
    }

    if (!doctor) {
      return errorResponse(res, "Doctor not found", 404);
    }

    let branches = await DoctorBranch.find({ doctorId: doctor._id, active: true });

    // If no branches exist in the collection yet, auto-provision from chambers
    if (branches.length === 0) {
      const chambersToSeed = (doctor.chambers && doctor.chambers.length > 0)
        ? doctor.chambers
        : [{
            name: doctor.workplace || "Rajshahi Medical College Hospital Branch",
            address: "Medical College Road, Laxmipur, Rajshahi",
            visiting_hours: "05:00 PM - 09:00 PM"
          }];

      const fee = doctor.consultation_fee || 800;

      for (let i = 0; i < chambersToSeed.length; i++) {
        const ch = chambersToSeed[i];
        const newBranch = await DoctorBranch.create({
          doctorId: doctor._id,
          name: ch.name || `Rajshahi Chamber ${i + 1}`,
          address: ch.address || "Laxmipur, Rajshahi",
          city: "Rajshahi",
          phone: (ch.appointment_numbers && ch.appointment_numbers[0]) || "01700000000",
          consultationFee: fee,
          roomNumber: `Room ${101 + i}`,
          active: true
        });

        // Seed default schedules (Sun to Thu)
        for (let day = 0; day <= 4; day++) {
          await DoctorSchedule.create({
            doctorId: doctor._id,
            branchId: newBranch._id,
            dayOfWeek: day,
            dayName: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day],
            startTime: "05:00 PM",
            endTime: "09:00 PM",
            slotDuration: 20,
            maxPatients: 12,
            consultationType: "both",
            active: true
          });
        }
      }

      branches = await DoctorBranch.find({ doctorId: doctor._id, active: true });
    }

    return successResponse(res, {
      doctor: {
        _id: doctor._id,
        name: doctor.name,
        specialty: doctor.specialty,
        qualifications: doctor.qualifications,
        designation: doctor.designation,
        experience: doctor.experience,
        imageUrl: doctor.imageUrl,
        consultationFee: doctor.consultation_fee || 800
      },
      branches
    }, "Doctor branches fetched");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doctors/:id/branches/:branchId/schedules
 */
exports.getBranchSchedules = async (req, res, next) => {
  try {
    const { id, branchId } = req.params;
    const schedules = await DoctorSchedule.find({
      branchId,
      active: true
    }).sort({ dayOfWeek: 1 });

    return successResponse(res, schedules, "Branch schedules fetched");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doctors/:id/branches/:branchId/slots?date=YYYY-MM-DD
 * Dynamic Slot Availability calculation checking existing bookings and active holds
 */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { id, branchId } = req.params;
    const { date } = req.query;

    if (!date) {
      return errorResponse(res, "Date query parameter (YYYY-MM-DD) is required", 422);
    }

    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      return errorResponse(res, "Invalid date format. Expected YYYY-MM-DD", 422);
    }

    // Resolve doctor
    let doctor = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id);
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ slug: id.toLowerCase() });
    }
    if (!doctor) return errorResponse(res, "Doctor not found", 404);

    const branch = await DoctorBranch.findById(branchId);
    if (!branch) return errorResponse(res, "Branch not found", 404);

    const dayOfWeek = queryDate.getDay(); // 0 = Sun, 1 = Mon ...
    const schedule = await DoctorSchedule.findOne({
      doctorId: doctor._id,
      branchId: branch._id,
      dayOfWeek,
      active: true
    });

    const startTime = schedule?.startTime || "05:00 PM";
    const endTime = schedule?.endTime || "09:00 PM";
    const slotDuration = schedule?.slotDuration || 20;

    const allSlots = generateTimeSlots(startTime, endTime, slotDuration);

    // Query existing appointments for this doctor + branch on this date
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
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
          status: {
            $in: [
              "CONFIRMED", "confirmed",
              "PENDING_PAYMENT", "awaiting_payment"
            ]
          }
        }
      ]
    });

    const now = new Date();
    const bookedSlotsMap = new Map();

    for (const appt of existingAppointments) {
      const slotTime = appt.time_slot || appt.startTime;
      if (!slotTime) continue;

      // Check if temporary hold has expired
      if (
        (appt.status === "PENDING_PAYMENT" || appt.status === "awaiting_payment") &&
        appt.holdExpiresAt &&
        now > new Date(appt.holdExpiresAt)
      ) {
        // Expired hold: release slot and update record in background
        Appointment.findByIdAndUpdate(appt._id, { status: "EXPIRED", paymentStatus: "FAILED" }).exec();
        continue;
      }

      bookedSlotsMap.set(slotTime.toUpperCase().trim(), {
        status: appt.status === "CONFIRMED" || appt.status === "confirmed" ? "BOOKED" : "HELD",
        appointmentId: appt.appointmentId || appt._id
      });
    }

    const calculatedSlots = allSlots.map((slot) => {
      const normalized = slot.toUpperCase().trim();
      const booking = bookedSlotsMap.get(normalized);

      if (booking) {
        return {
          time: slot,
          available: false,
          status: booking.status,
          reason: booking.status === "BOOKED" ? "Slot already booked" : "Temporarily held for checkout"
        };
      }

      return {
        time: slot,
        available: true,
        status: "AVAILABLE",
        reason: "Available for booking"
      };
    });

    const availableCount = calculatedSlots.filter(s => s.available).length;

    return successResponse(res, {
      date,
      doctorId: doctor._id,
      doctorName: doctor.name,
      branchId: branch._id,
      branchName: branch.name,
      consultationFee: branch.consultationFee || doctor.consultation_fee || 800,
      totalSlots: calculatedSlots.length,
      availableSlotsCount: availableCount,
      slots: calculatedSlots
    }, "Available slots calculated");
  } catch (err) {
    next(err);
  }
};
