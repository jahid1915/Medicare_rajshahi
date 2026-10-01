const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
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
    const [total, verified, specialties1, specialties2, chambers] = await Promise.all([
      Doctor.countDocuments({ is_active: true }),
      Doctor.countDocuments({ is_active: true, verified: true }),
      Doctor.distinct("specialty", { is_active: true, specialty: { $nin: [null, "", "Skip to content"] } }),
      Doctor.distinct("specialties", { is_active: true }),
      Doctor.aggregate([
        { $match: { is_active: true } },
        { $unwind: "$chambers" },
        { $group: { _id: "$chambers.name" } },
        { $count: "total" }
      ])
    ]);
    const allUniqueSpecialties = new Set([...specialties1, ...specialties2].filter(Boolean));
    const data = {
      total,
      verified,
      specialties: allUniqueSpecialties.size,
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
 * Returns sorted list of unique specialties with counts
 */
router.get(["/meta/specialties", "/specialties"], async (req, res, next) => {
  try {
    if (metaCache.specialties.data && metaCache.specialties.expires > Date.now()) {
      return successResponse(res, metaCache.specialties.data, "Specialties fetched from cache");
    }
    const result = await Doctor.aggregate([
      { $match: { is_active: true } },
      {
        $project: {
          allSpecialties: {
            $setUnion: [
              { $cond: [{ $and: [{ $ne: ["$specialty", null] }, { $ne: ["$specialty", ""] }, { $ne: ["$specialty", "Skip to content"] }] }, ["$specialty"], []] },
              { $cond: [{ $isArray: "$specialties" }, "$specialties", []] }
            ]
          }
        }
      },
      { $unwind: "$allSpecialties" },
      { $match: { allSpecialties: { $nin: [null, "", "Skip to content"] } } },
      { $group: { _id: "$allSpecialties", count: { $sum: 1 } } },
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
      const specRegex = new RegExp(`^${specialty.trim()}$`, "i");
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
    if (sort === "rating")      sortObj = { rating: -1, reviewCount: -1 };
    if (sort === "reviews")     sortObj = { reviewCount: -1, rating: -1 };
    if (sort === "name_asc")    sortObj = { name: 1 };
    if (sort === "name_desc")   sortObj = { name: -1 };

    const pageNum  = Math.max(1, parseInt(page));
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
