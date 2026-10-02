const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const { protect, optionalAuth } = require("../middleware/auth");
const { supabaseAdmin, isSupabaseConfigured } = require("../config/supabase");
const { successResponse, paginatedResponse, errorResponse } = require("../utils/responseHelper");

const metaCache = {
  stats: { data: null, expires: 0 },
  specialties: { data: null, expires: 0 },
  workplaces: { data: null, expires: 0 },
  chambers: { data: null, expires: 0 }
};
const CACHE_TTL = 3600000; // 1 hour

// ─── Meta Endpoints (must come BEFORE /:slug) ────────────────────────────

/**
 * GET /api/doctors/meta/stats
 * Returns aggregate counts for hero section
 */
router.get("/meta/stats", async (req, res, next) => {
  try {
    if (metaCache.stats.data && metaCache.stats.expires > Date.now()) {
      return successResponse(res, metaCache.stats.data, "Stats fetched from cache");
    }
    const [total, verified, specialties, chambers] = await Promise.all([
      Doctor.countDocuments({ is_active: true }),
      Doctor.countDocuments({ is_active: true, verified: true }),
      Doctor.distinct("specialty", { is_active: true, specialty: { $nin: [null, "", "Skip to content"] } }),
      Doctor.aggregate([
        { $match: { is_active: true } },
        { $unwind: "$chambers" },
        { $group: { _id: "$chambers.name" } },
        { $count: "total" }
      ])
    ]);
    const data = {
      total,
      verified,
      specialties: specialties.length,
      chambers: chambers[0]?.total || 0,
      city: "Rajshahi"
    };
    metaCache.stats.data = data;
    metaCache.stats.expires = Date.now() + CACHE_TTL;
    return successResponse(res, data, "Stats fetched");
  } catch (err) { next(err); }
});

/**
 * GET /api/doctors/meta/specialties and /api/doctors/specialties
 * Returns sorted list of 31 canonical specialties with counts
 */
router.get(["/meta/specialties", "/specialties"], async (req, res, next) => {
  try {
    if (metaCache.specialties.data && metaCache.specialties.expires > Date.now()) {
      return successResponse(res, metaCache.specialties.data, "Specialties fetched from cache");
    }
    const result = await Doctor.aggregate([
      { $match: { is_active: true, specialty: { $nin: [null, "", "Skip to content"] } } },
      { $group: { _id: "$specialty", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, specialty: "$_id", count: 1 } }
    ]);
    metaCache.specialties.data = result;
    metaCache.specialties.expires = Date.now() + CACHE_TTL;
    return successResponse(res, result, "Specialties fetched");
  } catch (err) { next(err); }
});

/**
 * GET /api/doctors/meta/workplaces
 * Returns sorted list of unique workplaces
 */
router.get("/meta/workplaces", async (req, res, next) => {
  try {
    if (metaCache.workplaces.data && metaCache.workplaces.expires > Date.now()) {
      return successResponse(res, metaCache.workplaces.data, "Workplaces fetched from cache");
    }
    const result = await Doctor.aggregate([
      { $match: { is_active: true, workplace: { $nin: [null, ""] } } },
      { $group: { _id: "$workplace", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
      { $project: { _id: 0, workplace: "$_id", count: 1 } }
    ]);
    metaCache.workplaces.data = result;
    metaCache.workplaces.expires = Date.now() + CACHE_TTL;
    return successResponse(res, result, "Workplaces fetched");
  } catch (err) { next(err); }
});

/**
 * GET /api/doctors/meta/chambers
 * Returns sorted list of unique chamber names
 */
router.get("/meta/chambers", async (req, res, next) => {
  try {
    if (metaCache.chambers.data && metaCache.chambers.expires > Date.now()) {
      return successResponse(res, metaCache.chambers.data, "Chambers fetched from cache");
    }
    const result = await Doctor.aggregate([
      { $match: { is_active: true } },
      { $unwind: "$chambers" },
      { $match: { "chambers.name": { $nin: [null, "", "Chamber"] } } },
      { $group: { _id: "$chambers.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 60 },
      { $project: { _id: 0, chamber: "$_id", count: 1 } }
    ]);
    metaCache.chambers.data = result;
    metaCache.chambers.expires = Date.now() + CACHE_TTL;
    return successResponse(res, result, "Chambers fetched");
  } catch (err) { next(err); }
});

// ─── Doctor Portal Authenticated Endpoints ─────────────────────────────────

/**
 * Helper to resolve doctor profile for authenticated user
 */
async function resolveDoctorForUser(user) {
  if (!user) return null;
  const userId = user.id || user._id;

  // 1. Check by user_id
  let doctor = await Doctor.findOne({ user_id: userId });
  if (doctor) return doctor;

  // 2. Check by doctor_id if assigned
  if (user.doctor_id) {
    doctor = await Doctor.findById(user.doctor_id);
    if (doctor) return doctor;
  }

  // 3. Match by email or clean name
  if (user.email) {
    doctor = await Doctor.findOne({
      $or: [
        { email: user.email.toLowerCase() },
        { name: new RegExp(`^${user.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }
      ]
    });
    if (doctor) {
      if (!doctor.user_id) {
        doctor.user_id = userId;
        await doctor.save();
      }
      return doctor;
    }
  }

  // 4. Fallback search in Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data: sbDocs } = await supabaseAdmin
        .from("doctors")
        .select("*")
        .or(`email.ilike.${user.email || 'none'},name.ilike.${user.name}`)
        .limit(1);
      if (sbDocs && sbDocs.length > 0 && sbDocs[0].legacy_mongodb_id) {
        doctor = await Doctor.findById(sbDocs[0].legacy_mongodb_id);
        if (doctor) {
          doctor.user_id = userId;
          await doctor.save();
          return doctor;
        }
      }
    } catch (_) {}
  }

  // 5. If doctor role and no record exists, synthesize one
  if (["doctor", "specialist_doctor"].includes(user.role)) {
    const slug = (user.name || "doctor").toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") + "-" + String(userId).slice(-4);
    doctor = await Doctor.create({
      user_id: userId,
      name: user.name || "Dr. Attending Physician",
      slug,
      specialty: user.specialization || "General Medicine",
      specialties: [user.specialization || "General Medicine"],
      qualifications: user.qualifications || "MBBS",
      verified: true,
      city: "Rajshahi",
      chambers: [
        {
          name: "Rajshahi Central Chamber",
          address: "Laxmipur, Rajshahi",
          visiting_hours: "05:00 PM - 09:00 PM",
          closed_day: "Friday",
          appointment: user.phone || "01700000000"
        }
      ]
    });

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from("doctors").insert({
          legacy_mongodb_id: doctor._id.toString(),
          name: doctor.name,
          slug: doctor.slug,
          specialty: doctor.specialty,
          qualifications: doctor.qualifications,
          city: "Rajshahi",
          verified: true
        });
      } catch (_) {}
    }
  }

  return doctor;
}

/**
 * GET /api/doctors/me
 * Retrieves current doctor's full profile and live stats
 */
router.get("/me", protect, async (req, res, next) => {
  try {
    const doctor = await resolveDoctorForUser(req.user);
    if (!doctor) {
      return errorResponse(res, "Doctor profile not found for current session", 404);
    }
    return successResponse(res, doctor, "Doctor profile retrieved");
  } catch (err) { next(err); }
});

/**
 * PUT /api/doctors/me
 * Doctor updates profile, syncing directly to Supabase
 */
router.put("/me", protect, async (req, res, next) => {
  try {
    let doctor = await resolveDoctorForUser(req.user);
    if (!doctor) {
      return errorResponse(res, "Doctor profile not found", 404);
    }

    const {
      name, specialty, specialties, qualifications, degrees,
      designation, workplace, experience, biography, bmdcRegistration,
      chambers, consultation_fee, available_for_telemedicine
    } = req.body;

    if (name !== undefined) doctor.name = name.trim();
    if (specialty !== undefined) doctor.specialty = specialty.trim();
    if (specialties !== undefined) doctor.specialties = Array.isArray(specialties) ? specialties : [specialties];
    if (qualifications !== undefined) doctor.qualifications = qualifications.trim();
    if (degrees !== undefined) doctor.degrees = Array.isArray(degrees) ? degrees : [degrees];
    if (designation !== undefined) doctor.designation = designation.trim();
    if (workplace !== undefined) doctor.workplace = workplace.trim();
    if (experience !== undefined) doctor.experience = experience.trim();
    if (biography !== undefined) doctor.biography = biography.trim();
    if (bmdcRegistration !== undefined) doctor.bmdcRegistration = bmdcRegistration.trim();
    if (chambers !== undefined && Array.isArray(chambers)) doctor.chambers = chambers;
    if (consultation_fee !== undefined) doctor.consultation_fee = Number(consultation_fee);
    if (available_for_telemedicine !== undefined) doctor.available_for_telemedicine = Boolean(available_for_telemedicine);

    await doctor.save();

    // Persist updates to Supabase PostgreSQL (Part 29 requirement)
    if (isSupabaseConfigured()) {
      try {
        const sbDocUpdate = {
          name: doctor.name,
          specialty: doctor.specialty,
          qualifications: doctor.qualifications,
          designation: doctor.designation,
          workplace: doctor.workplace,
          experience: doctor.experience,
          biography: doctor.biography,
          bmdc_registration: doctor.bmdcRegistration,
          consultation_fee: doctor.consultation_fee,
          available_for_telemedicine: doctor.available_for_telemedicine,
          updated_at: new Date().toISOString()
        };
        await supabaseAdmin
          .from("doctors")
          .update(sbDocUpdate)
          .or(`legacy_mongodb_id.eq.${doctor._id},id.eq.${doctor._id}`);
      } catch (sbErr) {
        console.warn("⚠️ [Supabase] Doctor profile sync warning:", sbErr.message);
      }
    }

    return successResponse(res, doctor, "Doctor profile updated and synced successfully");
  } catch (err) { next(err); }
});

/**
 * GET /api/doctors/me/patients
 * Aggregates patient list for current doctor
 */
router.get("/me/patients", protect, async (req, res, next) => {
  try {
    const doctor = await resolveDoctorForUser(req.user);
    const docId = doctor ? doctor._id : (req.user.id || req.user._id);

    const Appointment = require("../models/Appointment");
    const appts = await Appointment.find({
      $or: [
        { doctorId: docId },
        { doctor_id: docId }
      ]
    })
      .populate("patientId", "name phone email gender date_of_birth blood_group allergies existing_conditions medical_history")
      .sort({ appointmentDate: -1, createdAt: -1 })
      .lean();

    const patientMap = new Map();
    for (const a of appts) {
      const pKey = a.patientId?._id?.toString() || a.patientPhone || a.patientEmail || a.patientName;
      if (!pKey) continue;

      if (!patientMap.has(pKey)) {
        patientMap.set(pKey, {
          id: pKey,
          patientId: a.patientId?._id || a.patientId || pKey,
          name: a.patientName || a.patientId?.name || "Patient",
          phone: a.patientPhone || a.patientId?.phone || "N/A",
          email: a.patientEmail || a.patientId?.email || "",
          gender: a.patientId?.gender || a.gender || "Not specified",
          bloodGroup: a.patientId?.blood_group || a.bloodGroup || "Unknown",
          dateOfBirth: a.patientId?.date_of_birth,
          allergies: a.patientId?.allergies || "None",
          existingConditions: a.patientId?.existing_conditions || "None",
          lastAppointmentDate: a.appointmentDate,
          lastAppointmentType: a.appointmentType || a.consultation_type || "in_person",
          totalAppointments: 1,
          latestDiagnosis: a.consultationReason || a.doctor_notes || "Clinical Consultation",
          status: a.status || "CONFIRMED",
          serialNumber: a.serialNumber || a.appointmentId
        });
      } else {
        const existing = patientMap.get(pKey);
        existing.totalAppointments += 1;
      }
    }

    const patientList = Array.from(patientMap.values());
    return successResponse(res, { patients: patientList, total: patientList.length }, "Patient records retrieved");
  } catch (err) { next(err); }
});

/**
 * GET /api/doctors/me/schedule
 * Schedule & Chamber management for doctor
 */
router.get("/me/schedule", protect, async (req, res, next) => {
  try {
    const doctor = await resolveDoctorForUser(req.user);
    if (!doctor) return errorResponse(res, "Doctor profile not found", 404);

    const DoctorBranch = require("../models/DoctorBranch");
    const DoctorSchedule = require("../models/DoctorSchedule");

    let branches = await DoctorBranch.find({ doctorId: doctor._id }).lean();
    if (!branches || branches.length === 0) {
      if (doctor.chambers && doctor.chambers.length > 0) {
        for (const ch of doctor.chambers) {
          const br = await DoctorBranch.create({
            doctorId: doctor._id,
            name: ch.name || "Main Chamber",
            address: ch.address || "Rajshahi",
            city: "Rajshahi",
            visitingHours: ch.visiting_hours || "05:00 PM - 09:00 PM",
            closedDay: ch.closed_day || "Friday",
            consultationFee: doctor.consultation_fee || 800
          });
          branches.push(br.toObject ? br.toObject() : br);
        }
      }
    }

    const schedules = await DoctorSchedule.find({ doctorId: doctor._id }).lean();

    return successResponse(res, {
      doctor: { id: doctor._id, name: doctor.name, specialty: doctor.specialty },
      chambers: doctor.chambers || [],
      branches: branches || [],
      schedules: schedules || []
    }, "Doctor schedule retrieved");
  } catch (err) { next(err); }
});

/**
 * POST /api/doctors/me/schedule/slot-toggle
 * Toggle day/slot availability
 */
router.post("/me/schedule/slot-toggle", protect, async (req, res, next) => {
  try {
    const doctor = await resolveDoctorForUser(req.user);
    if (!doctor) return errorResponse(res, "Doctor profile not found", 404);

    const { branchId, dayOfWeek, isAvailable, startTime = "05:00 PM", endTime = "09:00 PM" } = req.body;
    const DoctorSchedule = require("../models/DoctorSchedule");
    const DoctorBranch = require("../models/DoctorBranch");

    let schedule = await DoctorSchedule.findOne({
      doctorId: doctor._id,
      dayOfWeek: Number(dayOfWeek)
    });

    if (!schedule) {
      let targetBranchId = branchId;
      if (!targetBranchId) {
        let branch = await DoctorBranch.findOne({ doctorId: doctor._id });
        if (!branch) {
          branch = await DoctorBranch.create({
            doctorId: doctor._id,
            name: doctor.chambers?.[0]?.name || "Rajshahi Central Chamber",
            address: doctor.chambers?.[0]?.address || "Laxmipur, Rajshahi",
            city: "Rajshahi",
            visitingHours: "05:00 PM - 09:00 PM",
            consultationFee: doctor.consultation_fee || 800
          });
        }
        targetBranchId = branch._id;
      }

      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      schedule = new DoctorSchedule({
        doctorId: doctor._id,
        branchId: targetBranchId,
        dayOfWeek: Number(dayOfWeek),
        dayName: dayNames[Number(dayOfWeek)] || "Monday",
        startTime,
        endTime,
        active: Boolean(isAvailable)
      });
    } else {
      schedule.active = Boolean(isAvailable);
    }

    await schedule.save();

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin
          .from("doctor_schedules")
          .update({ active: Boolean(isAvailable), updated_at: new Date().toISOString() })
          .eq("doctor_id", doctor._id.toString())
          .eq("day_of_week", Number(dayOfWeek));
      } catch (sbErr) {
        console.warn("⚠️ [Supabase] Schedule sync error:", sbErr.message);
      }
    }

    return successResponse(res, schedule, "Schedule slot status updated");
  } catch (err) { next(err); }
});

/**
 * GET /api/doctors/me/stats
 * Overview dashboard metrics
 */
router.get("/me/stats", protect, async (req, res, next) => {
  try {
    const doctor = await resolveDoctorForUser(req.user);
    const docId = doctor ? doctor._id : (req.user.id || req.user._id);

    const Appointment = require("../models/Appointment");
    const Prescription = require("../models/Prescription");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayCount, pendingCount, completedCount, totalAppts, totalRx] = await Promise.all([
      Appointment.countDocuments({
        $or: [{ doctorId: docId }, { doctor_id: docId }],
        appointmentDate: { $gte: todayStart, $lte: todayEnd }
      }),
      Appointment.countDocuments({
        $or: [{ doctorId: docId }, { doctor_id: docId }],
        status: { $in: ["PENDING", "pending", "CONFIRMED", "confirmed"] }
      }),
      Appointment.countDocuments({
        $or: [{ doctorId: docId }, { doctor_id: docId }],
        status: { $in: ["COMPLETED", "completed"] }
      }),
      Appointment.countDocuments({
        $or: [{ doctorId: docId }, { doctor_id: docId }]
      }),
      Prescription.countDocuments({
        $or: [{ doctor_id: docId }, { doctor_id: req.user._id }]
      })
    ]);

    const estimatedRevenue = completedCount * (doctor?.consultation_fee || 800);

    return successResponse(res, {
      todayAppointments: todayCount,
      pendingRequests: pendingCount,
      completedConsultations: completedCount,
      totalAppointments: totalAppts,
      totalPrescriptions: totalRx,
      estimatedRevenue,
      doctorName: doctor?.name || req.user.name,
      specialty: doctor?.specialty || "Specialist Physician"
    }, "Doctor portal statistics retrieved");
  } catch (err) { next(err); }
});

// ─── Main List Endpoint ───────────────────────────────────────────────────

/**
 * GET /api/doctors
 * Supports: q, specialty, workplace, chamber, verified, rating, sort, page, limit
 */
router.get("/", async (req, res, next) => {
  try {
    const {
      q,
      specialty,
      workplace,
      chamber,
      verified,
      rating,
      sort = "recommended",
      page = 1,
      limit = 12
    } = req.query;

    const filter = { is_active: true };

    // Search query
    if (q && q.trim()) {
      const qTerm = q.trim();
      const escaped = qTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const qRegex = new RegExp(escaped, "i");
      filter.$or = [
        { name: qRegex },
        { specialty: qRegex },
        { specialties: qRegex },
        { workplace: qRegex },
        { designation: qRegex },
        { qualifications: qRegex },
        { medical_focus: qRegex },
        { "chambers.name": qRegex },
        { "chambers.address": qRegex }
      ];
    }

    // Filters
    if (specialty && specialty !== "all") {
      let specSearch = specialty.trim();
      const specLower = specSearch.toLowerCase();
      if (['general medicine', 'internal medicine', 'general practice'].includes(specLower)) {
        specSearch = 'Medicine';
      } else if (['surgery', 'colorectal surgery', 'plastic surgery', 'laparoscopic surgery'].includes(specLower)) {
        specSearch = 'General Surgery';
      } else if (specLower === 'anesthesiology') {
        specSearch = 'Anaesthesiology';
      } else if (specLower === 'dermatology') {
        specSearch = 'Dermatology & Venereology';
      } else if (specLower === 'endocrinology') {
        specSearch = 'Endocrinology & Diabetes';
      } else if (['gastroenterology', 'hepatology'].includes(specLower)) {
        specSearch = 'Gastroenterology & Hepatology';
      } else if (specLower === 'physical medicine') {
        specSearch = 'Physical Medicine & Rehabilitation';
      } else if (specLower === 'psychiatry') {
        specSearch = 'Psychiatry & Mental Health';
      } else if (specLower === 'pulmonology') {
        specSearch = 'Pulmonology & Respiratory Medicine';
      }

      const escapedSpec = specSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const specRegex = new RegExp(`^${escapedSpec}$`, "i");
      const specFilter = {
        $or: [
          { specialty: specRegex },
          { specialties: specRegex }
        ]
      };
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          specFilter
        ];
        delete filter.$or;
      } else {
        filter.$or = specFilter.$or;
      }
    }
    if (workplace && workplace !== "all") {
      filter.workplace = new RegExp(workplace.trim(), "i");
    }
    if (chamber && chamber !== "all") {
      filter["chambers.name"] = new RegExp(chamber.trim(), "i");
    }
    if (verified === "true") {
      filter.verified = true;
    }
    if (rating) {
      const minRating = parseFloat(rating);
      if (!isNaN(minRating)) filter.rating = { $gte: minRating };
    }

    // Sort
    let sortObj = { verified: -1, reviewCount: -1, rating: -1 };
    if (sort === "rating") sortObj = { rating: -1, reviewCount: -1 };
    if (sort === "reviews") sortObj = { reviewCount: -1, rating: -1 };
    if (sort === "name_asc") sortObj = { name: 1 };
    if (sort === "name_desc") sortObj = { name: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(48, Math.max(1, parseInt(limit)));

    const [total, doctors] = await Promise.all([
      Doctor.countDocuments(filter),
      Doctor.find(filter, {
        name: 1, slug: 1, specialty: 1, specialties: 1, designation: 1, workplace: 1,
        qualifications: 1, degrees: 1, experience: 1, verified: 1, rating: 1, reviewCount: 1,
        imageUrl: 1, chambers: 1, bmdcRegistration: 1, medical_focus: 1, source: 1, source_metadata: 1
      })
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean()
    ]);

    return paginatedResponse(res, doctors, total, pageNum, limitNum, "Doctors fetched");
  } catch (err) { next(err); }
});

const {
  getDoctorBranches,
  getBranchSchedules,
  getAvailableSlots
} = require("../controllers/doctorScheduleController");

// ─── Doctor Branches & Schedule Slots ─────────────────────────────────────
router.get("/:id/branches", getDoctorBranches);
router.get("/:id/branches/:branchId/schedules", getBranchSchedules);
router.get("/:id/branches/:branchId/slots", getAvailableSlots);

// ─── Doctor Profile by Slug ───────────────────────────────────────────────

/**
 * GET /api/doctors/:slug
 * Full doctor profile
 */
router.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Try slug first, then fallback to _id for backward compatibility
    let doctor = await Doctor.findOne({ slug: slug.toLowerCase(), is_active: true }).lean();

    if (!doctor && slug.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(slug).lean();
    }

    if (!doctor) return errorResponse(res, "Doctor not found", 404, "NOT_FOUND");
    return successResponse(res, doctor, "Doctor profile fetched");
  } catch (err) { next(err); }
});

module.exports = router;
