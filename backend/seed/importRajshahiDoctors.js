/**
 * Niramoy — Doctor Import & Deduplication Script
 * 
 * Processes rajshahi_doctors.json (BDDoctorDirectory source) and normalizes
 * specialty fields, then upserts into MongoDB using the deduplication service.
 * 
 * Usage: node seed/importRajshahiDoctors.js
 */

const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Doctor = require("../models/Doctor");
const { detectSpecialty } = require("./specialtyDetector");
const {
  normalizeName, normalizeSpecialty, normalizePhone,
  findDuplicate, findBySourceUrl, mergeDoctors, generateSignals,
  CANONICAL_SPECIALTIES,
} = require("../services/doctorDeduplicationService");

function slugify(text) {
  return (text || "").toString().toLowerCase().trim()
    .replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-")
    .replace(/^-+/, "").replace(/-+$/, "");
}

async function generateUniqueSlug(name, existingSlugs) {
  const base = slugify(name.replace(/^(prof\.|dr\.|doctor)\s*/i, "")) || "doctor";
  let slug = base;
  let counter = 1;
  while (existingSlugs.has(slug)) { counter++; slug = `${base}-${counter}`; }
  existingSlugs.add(slug);
  return slug;
}

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) { console.error("MONGO_URI missing"); process.exit(1); }
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const jsonPath = path.join(__dirname, "../rajshahi_doctors.json");
  const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const rawDoctors = raw.doctors || [];
  console.log(`Loaded ${rawDoctors.length} raw doctor records from BDDoctorDirectory`);

  const existingDoctors = await Doctor.find({}).lean();
  console.log(`Found ${existingDoctors.length} existing doctors in DB`);

  const existingSlugs = new Set(existingDoctors.map(d => d.slug));

  const report = {
    total_raw: rawDoctors.length,
    existing_in_db: existingDoctors.length,
    new_created: 0,
    updated: 0,
    skipped_by_url: 0,
    skipped_dedup: 0,
    errors: 0,
    specialties_set: new Set(),
  };

  for (let i = 0; i < rawDoctors.length; i++) {
    const raw = rawDoctors[i];
    try {
      const normalizedSpecialty = normalizeSpecialty(
        detectSpecialty(raw.qualifications, raw.designation)
      );
      if (normalizedSpecialty) report.specialties_set.add(normalizedSpecialty);

      const sourceEntry = {
        website: "BDDoctorDirectory",
        profileUrl: raw.profile_url || "",
        importedAt: new Date(),
      };

      const docData = {
        name: raw.name || "Unknown Doctor",
        normalized_name: normalizeName(raw.name),
        specialty: normalizedSpecialty || "General Medicine",
        specialties: normalizedSpecialty ? [normalizedSpecialty] : [],
        qualifications: raw.qualifications || null,
        degrees: raw.qualifications ? raw.qualifications.split(/,(?![^(]*\))/).map(d => d.trim()).filter(Boolean) : [],
        designation: raw.designation || null,
        workplace: raw.workplace || null,
        experience: raw.experience || null,
        bmdcRegistration: raw.bmdc_registration || null,
        verified: raw.verified || false,
        rating: raw.rating || null,
        reviewCount: raw.review_count || 0,
        imageUrl: raw.image_url || null,
        profileUrl: raw.profile_url || null,
        source: "BDDoctorDirectory",
        source_metadata: {
          name: "BDDoctorDirectory",
          profile_url: raw.profile_url || null,
          last_imported_at: new Date(),
        },
        sources: [sourceEntry],
        source_entry: sourceEntry,
        chambers: (raw.chambers || []).map(ch => ({
          name: ch.name || "Chamber",
          address: ch.address || "Rajshahi",
          visiting_hours: ch.visiting_hours || null,
          visiting_hour: ch.visiting_hours || null,
          appointment: ch.appointment || null,
          appointment_numbers: ch.appointment_numbers || [],
          google_map: ch.google_map || null,
        })),
        city: "Rajshahi",
        country: "Bangladesh",
        is_active: true,
      };

      // 1. Check by source profile URL first (idempotency)
      const byUrl = findBySourceUrl(raw.profile_url, existingDoctors);
      if (byUrl) {
        const updates = mergeDoctors(byUrl, docData);
        await Doctor.updateOne({ _id: byUrl._id }, { $set: updates });
        // Update local array for subsequent dedup checks
        Object.assign(byUrl, updates);
        report.skipped_by_url++;
        continue;
      }

      // 2. Deduplication matching
      const { match, confidence, level, reasons } = findDuplicate(docData, existingDoctors);
      if (match && level === "strong") {
        const updates = mergeDoctors(match, docData);
        await Doctor.updateOne({ _id: match._id }, { $set: updates });
        Object.assign(match, updates);
        report.updated++;
        continue;
      }
      if (match && level === "moderate") {
        // Flag as potential duplicate but still import separately
        docData.adminNotes = `Potential duplicate of ${match.name} (confidence: ${(confidence*100).toFixed(0)}%). Reasons: ${reasons.join("; ")}`;
      }

      // 3. Create new doctor
      const slug = await generateUniqueSlug(raw.name, existingSlugs);
      const localJpg = path.join(__dirname, "../../frontend/public/doctor-images", `${slug}.jpg`);
      const localWebp = path.join(__dirname, "../../frontend/public/doctor-images", `${slug}.webp`);
      if (fs.existsSync(localJpg)) {
        docData.imageUrl = `/doctor-images/${slug}.jpg`;
      } else if (fs.existsSync(localWebp)) {
        docData.imageUrl = `/doctor-images/${slug}.webp`;
      }
      const newDoc = new Doctor({ ...docData, slug });
      await newDoc.save();
      existingDoctors.push(newDoc.toObject ? newDoc.toObject() : newDoc);
      report.new_created++;

      if (i % 50 === 0) console.log(`Progress: ${i}/${rawDoctors.length}`);
    } catch (err) {
      console.error(`Error at record ${i} (${raw.name}):`, err.message);
      report.errors++;
    }
  }

  // Normalize specialties on all existing records with "Skip to content"
  const skipDocs = await Doctor.find({ specialty: "Skip to content" });
  console.log(`\nFixing ${skipDocs.length} doctors with "Skip to content" specialty...`);
  let fixed = 0;
  for (const doc of skipDocs) {
    const detected = detectSpecialty(doc.qualifications, doc.designation);
    const normalized = normalizeSpecialty(detected);
    if (normalized && normalized !== "Skip to content") {
      await Doctor.updateOne({ _id: doc._id }, { $set: {
        specialty: normalized,
        specialties: [normalized],
      }});
      fixed++;
    }
  }

  await mongoose.disconnect();
  
  console.log("\n=== IMPORT REPORT ===");
  console.log(`Raw records from BDDoctorDirectory: ${report.total_raw}`);
  console.log(`Existing doctors in DB before import: ${report.existing_in_db}`);
  console.log(`New doctors created: ${report.new_created}`);
  console.log(`Existing doctors updated/enriched: ${report.updated}`);
  console.log(`Skipped (same source URL idempotent): ${report.skipped_by_url}`);
  console.log(`Doctors with specialty fixed: ${fixed}`);
  console.log(`Unique specialties found: ${report.specialties_set.size}`);
  console.log(`Errors: ${report.errors}`);
  console.log("====================\n");
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
