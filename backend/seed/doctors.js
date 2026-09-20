/**
 * Doctor Seed Script — Medicare Rajshahi
 * Imports 351 Rajshahi doctors from BDDoctorDirectory JSON
 *
 * Features:
 * - Detects specialty from qualifications
 * - Generates unique slugs
 * - Idempotent: upserts by profile_url (safe to run multiple times)
 * - Normalizes phone numbers, strips duplicates
 * - Handles missing fields gracefully
 */

const path = require("path");
const fs = require("fs");
const Doctor = require("../models/Doctor");
const { detectSpecialty } = require("./specialtyDetector");

// ─── Slug Generator ────────────────────────────────────────────────────────
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/prof\.\s*/gi, "")
    .replace(/dr\.\s*/gi, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
}

async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  while (await Doctor.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

// ─── Normalizers ───────────────────────────────────────────────────────────
function normalizeStr(val) {
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  if (!trimmed || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") return null;
  return trimmed;
}

function normalizeRating(val) {
  const n = parseFloat(val);
  if (isNaN(n) || n < 0 || n > 5) return null;
  return Math.round(n * 10) / 10;
}

function normalizeReviewCount(val) {
  const n = parseInt(val);
  if (isNaN(n) || n < 0) return 0;
  return n;
}

function normalizePhones(arr) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  return arr
    .map(p => normalizeStr(String(p || "")))
    .filter(Boolean)
    .filter(p => {
      if (seen.has(p)) return false;
      seen.add(p);
      return true;
    });
}

function normalizeChambers(rawChambers) {
  if (!Array.isArray(rawChambers)) return [];
  return rawChambers
    .filter(c => c && typeof c === "object")
    .map(c => ({
      name:                normalizeStr(c.name) || "Chamber",
      address:             normalizeStr(c.address),
      visiting_hours:      normalizeStr(c.visiting_hours),
      appointment_numbers: normalizePhones(c.appointment_numbers || [])
    }))
    .filter(c => c.name);
}

// ─── Stats Tracker ─────────────────────────────────────────────────────────
const stats = {
  total: 0, inserted: 0, updated: 0, skipped: 0, errors: 0,
  missingPhone: 0, missingSchedule: 0, missingImage: 0, missingBmdc: 0,
  missingExperience: 0, specialties: {}
};

// ─── Main Seeder ───────────────────────────────────────────────────────────
async function seedDoctors() {
  // Locate JSON — try root first, then same dir
  const possiblePaths = [
    path.join(__dirname, "../../rajshahi_doctors.json"),
    path.join(__dirname, "rajshahi_doctors.json"),
    path.join(__dirname, "../../../rajshahi_doctors.json"),
  ];

  let jsonPath = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) { jsonPath = p; break; }
  }

  if (!jsonPath) {
    console.error("❌ rajshahi_doctors.json not found! Place it in d:\\Medi\\ root.");
    process.exit(1);
  }

  console.log(`📂 Reading JSON from: ${jsonPath}`);
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const doctors = raw.doctors || [];
  stats.total = doctors.length;
  console.log(`📋 Found ${doctors.length} doctors in JSON\n`);

  // Track slugs used in this run to avoid duplicates within same JSON
  const slugsUsedThisRun = new Set();

  for (let i = 0; i < doctors.length; i++) {
    const d = doctors[i];
    try {
      const name      = normalizeStr(d.name);
      if (!name) { stats.skipped++; continue; }

      const profileUrl      = normalizeStr(d.profile_url);
      const qualifications  = normalizeStr(d.qualifications);
      const designation     = normalizeStr(d.designation);
      const specialty       = detectSpecialty(qualifications, designation);
      const chambers        = normalizeChambers(d.chambers || []);

      // Stats
      stats.specialties[specialty] = (stats.specialties[specialty] || 0) + 1;
      if (!normalizeStr(d.bmdc_registration)) stats.missingBmdc++;
      if (!normalizeStr(d.experience)) stats.missingExperience++;
      if (!normalizeStr(d.image_url)) stats.missingImage++;
      const hasPhone    = chambers.some(c => c.appointment_numbers.length > 0);
      const hasSchedule = chambers.some(c => c.visiting_hours);
      if (!hasPhone)    stats.missingPhone++;
      if (!hasSchedule) stats.missingSchedule++;

      // Generate unique slug
      let baseSlug = generateSlug(name);
      if (!baseSlug) baseSlug = `doctor-${i}`;

      // Check if slug already used in this run, add suffix if needed
      let slug = baseSlug;
      let counter = 1;
      while (slugsUsedThisRun.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Build doctor doc
      const doctorData = {
        name,
        slug,
        specialty,
        qualifications,
        training:         normalizeStr(d.training),
        designation,
        workplace:        normalizeStr(d.workplace),
        experience:       normalizeStr(d.experience),
        bmdcRegistration: normalizeStr(d.bmdc_registration),
        verified:         d.verified === true,
        rating:           normalizeRating(d.rating),
        reviewCount:      normalizeReviewCount(d.review_count),
        chambers,
        imageUrl:         normalizeStr(d.image_url),
        profileUrl,
        source:           normalizeStr(d.source) || "BDDoctorDirectory",
        lastScraped:      d.last_scraped ? new Date(d.last_scraped) : null,
        city:             "Rajshahi",
        country:          "Bangladesh",
        is_active:        true,
      };

      // Upsert by profile_url (stable unique identifier)
      const filter = profileUrl
        ? { profileUrl }
        : { slug };

      const existing = await Doctor.findOne(filter);

      if (existing) {
        // For updates, preserve the existing slug
        delete doctorData.slug;
        await Doctor.updateOne(filter, { $set: doctorData });
        stats.updated++;
      } else {
        // New doctor: ensure slug is truly unique in DB
        const finalSlug = await ensureUniqueSlug(slug);
        doctorData.slug = finalSlug;
        slugsUsedThisRun.add(finalSlug);
        await Doctor.create(doctorData);
        stats.inserted++;
        slugsUsedThisRun.add(slug);
      }

      if ((i + 1) % 50 === 0) {
        process.stdout.write(`  Progress: ${i + 1}/${doctors.length}\n`);
      }

    } catch (err) {
      stats.errors++;
      console.error(`  ❌ Error on doctor ${i}: ${d.name} — ${err.message}`);
    }
  }

  // ─── Summary Report ─────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════");
  console.log("🏥 DOCTOR SEED COMPLETE — STATS REPORT");
  console.log("════════════════════════════════════════");
  console.log(`Total in JSON:        ${stats.total}`);
  console.log(`✅ Inserted:          ${stats.inserted}`);
  console.log(`🔄 Updated:           ${stats.updated}`);
  console.log(`⚠️  Skipped:          ${stats.skipped}`);
  console.log(`❌ Errors:            ${stats.errors}`);
  console.log("────────────────────────────────────────");
  console.log(`Missing phone:        ${stats.missingPhone}`);
  console.log(`Missing schedule:     ${stats.missingSchedule}`);
  console.log(`Missing image:        ${stats.missingImage}`);
  console.log(`Missing BMDC:         ${stats.missingBmdc}`);
  console.log(`Missing experience:   ${stats.missingExperience}`);
  console.log("────────────────────────────────────────");
  console.log(`Unique specialties:   ${Object.keys(stats.specialties).length}`);

  const topSpecialties = Object.entries(stats.specialties)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 10);
  console.log("\nTop Specialties:");
  topSpecialties.forEach(([sp, count]) => {
    console.log(`  ${sp.padEnd(30)} ${count}`);
  });
  console.log("════════════════════════════════════════\n");
}

module.exports = seedDoctors;
