/**
 * MedicBD Rajshahi Doctors Migration & Integration Script
 *
 * Implements:
 * 1. Safe, non-destructive import of 327 MedicBD doctor records.
 * 2. Multi-signal matching & deduplication (name normalization, specialty, workplace, chamber, phone).
 * 3. Intelligent field-level merging (degrees, fellowships, multiple specialties, multi-chambers).
 * 4. Idempotency (running multiple times produces identical state without duplicates).
 * 5. Comprehensive migration report (JSON & CSV).
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Doctor = require('../models/Doctor');

// ─── Normalization Helpers ──────────────────────────────────────────────────

function normalizePunct(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[.,\-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitle(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ') // Strip nicknames e.g. (Limon), (Mizan)
    .replace(/\b(prof|professor|dr|doctor|brig|gen|col|major|md|mst|mohammad|mohammed|sk|sheikh|nutritionist|dietitian|consultant)\b\.?/gi, ' ')
    .replace(/[^a-z0-9]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSpecialty(spec) {
  if (!spec) return '';
  return spec
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanChamberName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/centre/g, 'center')
    .replace(/pvt\.?|ltd\.?/gi, '')
    .replace(/[.,\-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9+]/g, '').trim();
  if (digits.length < 8) return null;
  return digits;
}

// ─── Extraction Helpers for MedicBD Records ─────────────────────────────────

function extractSpecialty(mDoc) {
  if (mDoc.specialty && typeof mDoc.specialty === 'string' && mDoc.specialty.trim()) {
    return mDoc.specialty.trim();
  }
  if (mDoc.meta?.page_title) {
    const parts = mDoc.meta.page_title.split(' - ');
    if (parts.length >= 3 && parts[1].trim()) {
      return parts[1].trim();
    }
  }
  if (mDoc.biography) {
    const m = mDoc.biography.match(/provides medical care in ([^.]+)\./i);
    if (m && m[1].trim()) return m[1].trim();
  }
  return 'General Practice';
}

function extractHospital(mDoc) {
  if (mDoc.primary_hospital && typeof mDoc.primary_hospital === 'string' && mDoc.primary_hospital.trim()) {
    return mDoc.primary_hospital.trim();
  }
  if (mDoc.meta?.meta_description) {
    const m = mDoc.meta.meta_description.match(/Hospital:\s*([^.]+)\./i);
    if (m && m[1].trim()) return m[1].trim();
  }
  if (mDoc.biography) {
    const m = mDoc.biography.match(/Consultation information is available at ([^.]+)\./i);
    if (m && m[1].trim()) return m[1].trim();
  }
  return null;
}

function extractDesignation(mDoc) {
  if (mDoc.designation && typeof mDoc.designation === 'string' && mDoc.designation.trim()) {
    return mDoc.designation.trim();
  }
  if (mDoc.biography) {
    const m = mDoc.biography.match(/The doctor currently serves as ([^.]+)\./i);
    if (m && m[1].trim()) return m[1].trim();
  }
  return null;
}

function extractQualifications(mDoc) {
  if (mDoc.biography) {
    const m = mDoc.biography.match(/Qualifications include\s*([^.]+)\./i);
    if (m && m[1].trim()) return m[1].trim();
  }
  if (mDoc.degree && typeof mDoc.degree === 'string') {
    // If degree has long concatenated strings, take the first portion before designation/hospital
    const firstSentence = mDoc.degree.split(/\n|\r/)[0].trim();
    if (firstSentence) return firstSentence;
  }
  return null;
}

function extractDegreesArray(qualStr) {
  if (!qualStr) return [];
  // Split on commas, semicolons while respecting parenthesis
  const tokens = qualStr.split(/,(?![^(]*\))/).map(t => t.trim()).filter(Boolean);
  return Array.from(new Set(tokens));
}

function extractTraining(mDoc) {
  if (mDoc.biography) {
    const m = mDoc.biography.match(/Specialized training:\s*([^.]+)\./i);
    if (m && m[1].trim()) return m[1].trim();
  }
  return null;
}

function extractFellowships(mDoc) {
  if (mDoc.biography) {
    const m = mDoc.biography.match(/Fellowship:\s*([^.]+)\./i);
    if (m && m[1].trim()) {
      return Array.from(new Set(m[1].split(/,(?![^(]*\))/).map(f => f.trim()).filter(Boolean)));
    }
  }
  return [];
}

function extractExperience(mDoc) {
  if (mDoc.experience && typeof mDoc.experience === 'string' && mDoc.experience.trim()) {
    return mDoc.experience.trim();
  }
  if (mDoc.biography) {
    const m = mDoc.biography.match(/(\d+\+?\s*years?\s*(?:of)?\s*(?:professional)?\s*experience)/i);
    if (m && m[1].trim()) return m[1].trim();
  }
  return null;
}

function extractMedicalFocus(mDoc) {
  const focusList = new Set();
  if (mDoc.biography) {
    const m = mDoc.biography.match(/Clinical focus:\s*([^.]+)\./i);
    if (m && m[1].trim()) {
      m[1].split(/,(?![^(]*\))/).map(f => f.trim()).forEach(f => {
        if (f && f.length < 50) focusList.add(f);
      });
    }
  }
  if (Array.isArray(mDoc.medical_focus)) {
    mDoc.medical_focus.forEach(item => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        // Ignore scraper errors that grabbed hospital names or degree strings as focus
        if (
          trimmed &&
          trimmed.length < 50 &&
          !trimmed.toLowerCase().includes('hospital') &&
          !trimmed.toLowerCase().includes('diagnostic') &&
          !trimmed.toLowerCase().includes('complex') &&
          !trimmed.toLowerCase().includes('chamber') &&
          !trimmed.toLowerCase().includes('rajpara') &&
          !trimmed.toLowerCase().includes('laxmipur')
        ) {
          focusList.add(trimmed);
        }
      }
    });
  }
  return Array.from(focusList);
}

function extractEducationTraining(mDoc) {
  const result = new Set();
  if (Array.isArray(mDoc.education_training)) {
    mDoc.education_training.forEach(et => {
      if (typeof et === 'string') {
        const clean = et.replace(/^Education\s+/i, '').trim();
        if (clean) result.add(clean);
      }
    });
  }
  return Array.from(result);
}

function cleanChambers(mDocChambers) {
  if (!Array.isArray(mDocChambers)) return [];
  const cleanList = [];

  mDocChambers.forEach(ch => {
    if (!ch) return;
    const name = ch.name ? ch.name.trim() : null;
    const address = ch.address ? ch.address.trim() : null;

    // Filter out completely null chambers
    if (!name && !address) return;

    const visiting_hours = ch.visiting_hour ? ch.visiting_hour.trim() : null;
    const closed_day = ch.closed_day ? ch.closed_day.trim() : null;
    const appointment = ch.appointment ? ch.appointment.trim() : null;
    const phone = cleanPhone(appointment);
    const appointment_numbers = phone ? [phone] : [];
    const google_map = ch.google_map ? ch.google_map.trim() : null;

    cleanList.push({
      name: name || 'Chamber',
      address: address || 'Rajshahi',
      visiting_hours,
      visiting_hour: visiting_hours,
      closed_day,
      appointment,
      appointment_numbers,
      google_map
    });
  });

  return cleanList;
}

// ─── Slug Generator ─────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function generateUniqueSlug(name, existingSlugs) {
  const base = slugify(name.replace(/^(prof\.|dr\.|doctor)\s*/i, ''));
  let slug = base || 'doctor';
  let counter = 1;
  while (existingSlugs.has(slug)) {
    counter++;
    slug = `${base}-${counter}`;
  }
  existingSlugs.add(slug);
  return slug;
}

// ─── Main Migration Execution ───────────────────────────────────────────────

async function runMigration() {
  const startTime = Date.now();
  console.log('=====================================================');
  console.log('Starting MedicBD Rajshahi Doctors Integration...');
  console.log('=====================================================');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGO_URI is missing from environment variables.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB database successfully.');

  const jsonPath = path.join(__dirname, 'medicbd_rajshahi_doctors.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('ERROR: medicbd_rajshahi_doctors.json not found at:', jsonPath);
    await mongoose.disconnect();
    process.exit(1);
  }

  const medicbdDoctors = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Loaded ${medicbdDoctors.length} doctors from MedicBD JSON.`);

  // Load all existing doctors
  const existingDoctors = await Doctor.find();
  console.log(`Loaded ${existingDoctors.length} existing doctors from MongoDB.`);

  const existingSlugs = new Set(existingDoctors.map(d => d.slug.toLowerCase()));

  // Pre-index existing doctors
  const existingByProfileUrl = new Map();
  const existingByPunctName = new Map();
  const existingByCleanTitle = new Map();

  existingDoctors.forEach(doc => {
    // 1. Profile URL
    if (doc.profileUrl) existingByProfileUrl.set(doc.profileUrl.toLowerCase(), doc);
    if (doc.source_metadata?.profile_url) existingByProfileUrl.set(doc.source_metadata.profile_url.toLowerCase(), doc);

    // 2. Punct-normalized exact name
    const pName = normalizePunct(doc.name);
    if (!existingByPunctName.has(pName)) existingByPunctName.set(pName, []);
    existingByPunctName.get(pName).push(doc);

    // 3. Clean Title name
    const tName = cleanTitle(doc.name);
    if (!existingByCleanTitle.has(tName)) existingByCleanTitle.set(tName, []);
    existingByCleanTitle.get(tName).push(doc);
  });

  // Tracking metrics
  const report = {
    total_existing_doctors_initial: existingDoctors.length,
    medicbd_records_processed: medicbdDoctors.length,
    matched_existing_doctors: 0,
    new_doctors_added: 0,
    possible_duplicates_requiring_review: [],
    doctors_enriched: 0,
    new_chambers_added: 0,
    existing_chambers_updated: 0,
    new_specialties_count: 0,
    duplicate_records_prevented: 0,
    failed_records: 0
  };

  const allSpecialtiesBefore = new Set(existingDoctors.map(d => d.specialty).filter(Boolean));
  const allSpecialtiesAfter = new Set([...allSpecialtiesBefore]);

  // Process each MedicBD record
  for (let i = 0; i < medicbdDoctors.length; i++) {
    const mDoc = medicbdDoctors[i];

    try {
      const mSpecialty = extractSpecialty(mDoc);
      const mHospital = extractHospital(mDoc);
      const mDesignation = extractDesignation(mDoc);
      const mQualStr = extractQualifications(mDoc);
      const mDegrees = extractDegreesArray(mQualStr);
      const mTraining = extractTraining(mDoc);
      const mFellowships = extractFellowships(mDoc);
      const mExperience = extractExperience(mDoc);
      const mFocus = extractMedicalFocus(mDoc);
      const mEduTraining = extractEducationTraining(mDoc);
      const mChambers = cleanChambers(mDoc.chambers);

      // Deduplication Matching
      let targetDoctor = null;
      let matchMethod = null;
      let matchConfidence = 1.0;

      // Method 1: Profile URL match
      if (mDoc.profile_url) {
        const found = existingByProfileUrl.get(mDoc.profile_url.toLowerCase());
        if (found) {
          targetDoctor = found;
          matchMethod = 'profile_url';
        }
      }

      // Method 2: Punctuation-normalized exact name match
      if (!targetDoctor) {
        const mPunct = normalizePunct(mDoc.name);
        const candidates = existingByPunctName.get(mPunct) || [];

        if (candidates.length === 1) {
          targetDoctor = candidates[0];
          matchMethod = 'exact_punct_name';
        } else if (candidates.length > 1) {
          // Disambiguate by specialty
          const mCleanSpec = cleanSpecialty(mSpecialty);
          const specMatches = candidates.filter(c => {
            const cSpec = cleanSpecialty(c.specialty);
            return cSpec === mCleanSpec || cSpec.includes(mCleanSpec) || mCleanSpec.includes(cSpec);
          });
          if (specMatches.length === 1) {
            targetDoctor = specMatches[0];
            matchMethod = 'exact_name_and_specialty';
          }
        }
      }

      // Method 3: Title-cleaned name + specialty or chamber
      if (!targetDoctor) {
        const mTitleClean = cleanTitle(mDoc.name);
        const candidates = existingByCleanTitle.get(mTitleClean) || [];

        if (candidates.length === 1) {
          targetDoctor = candidates[0];
          matchMethod = 'cleaned_title_name';
        } else if (candidates.length > 1) {
          const mCleanSpec = cleanSpecialty(mSpecialty);
          const specMatches = candidates.filter(c => {
            const cSpec = cleanSpecialty(c.specialty);
            return cSpec === mCleanSpec || cSpec.includes(mCleanSpec) || mCleanSpec.includes(cSpec);
          });
          if (specMatches.length === 1) {
            targetDoctor = specMatches[0];
            matchMethod = 'clean_title_and_specialty';
          } else {
            // Chamber name check
            const mChamberNames = mChambers.map(c => cleanChamberName(c.name)).filter(Boolean);
            const chamberMatches = candidates.filter(c =>
              (c.chambers || []).some(ec =>
                mChamberNames.some(mcn => mcn.includes(cleanChamberName(ec.name)) || cleanChamberName(ec.name).includes(mcn))
              )
            );
            if (chamberMatches.length === 1) {
              targetDoctor = chamberMatches[0];
              matchMethod = 'clean_title_and_chamber';
            } else {
              report.possible_duplicates_requiring_review.push({
                existingDoctor: candidates.map(c => c.name),
                medicbdDoctor: mDoc.name,
                confidence: 0.70,
                reasons: ['Multiple doctors with similar base name and specialty']
              });
            }
          }
        }
      }

      // Method 4: Phone number cross-match across chambers
      if (!targetDoctor) {
        const mPhones = mChambers.flatMap(c => c.appointment_numbers).filter(Boolean);
        if (mPhones.length > 0) {
          for (const doc of existingDoctors) {
            const ePhones = (doc.chambers || []).flatMap(c => c.appointment_numbers || []).filter(Boolean);
            const hasPhoneMatch = mPhones.some(mp => ePhones.includes(mp));
            if (hasPhoneMatch) {
              targetDoctor = doc;
              matchMethod = 'chamber_phone_match';
              break;
            }
          }
        }
      }

      // CASE A: Doctor Exists -> Merge & Enrich
      if (targetDoctor) {
        report.matched_existing_doctors++;
        report.duplicate_records_prevented++;

        // 1. Source Names
        if (!targetDoctor.source_names) targetDoctor.source_names = [];
        if (mDoc.name && mDoc.name !== targetDoctor.name && !targetDoctor.source_names.includes(mDoc.name)) {
          targetDoctor.source_names.push(mDoc.name);
        }

        // 2. Specialty & Specialties Array
        if (!targetDoctor.specialties) targetDoctor.specialties = [];
        const specSet = new Set(targetDoctor.specialties);
        if (targetDoctor.specialty) specSet.add(targetDoctor.specialty);
        if (mSpecialty) specSet.add(mSpecialty);
        mFocus.forEach(f => {
          if (f.toLowerCase().includes('specialist') || f.toLowerCase().includes('surgeon')) {
            specSet.add(f);
          }
        });
        targetDoctor.specialties = Array.from(specSet).filter(Boolean);
        targetDoctor.specialties.forEach(s => allSpecialtiesAfter.add(s));

        // 3. Qualifications, Degrees & Fellowships
        if (!targetDoctor.degrees) targetDoctor.degrees = [];
        const degSet = new Set(targetDoctor.degrees);
        extractDegreesArray(targetDoctor.qualifications).forEach(d => degSet.add(d));
        mDegrees.forEach(d => degSet.add(d));
        targetDoctor.degrees = Array.from(degSet).filter(Boolean);

        if (!targetDoctor.qualifications && mQualStr) {
          targetDoctor.qualifications = mQualStr;
        } else if (targetDoctor.degrees.length > 0) {
          targetDoctor.qualifications = targetDoctor.degrees.join(', ');
        }

        if (!targetDoctor.fellowships) targetDoctor.fellowships = [];
        const fellowSet = new Set(targetDoctor.fellowships);
        mFellowships.forEach(f => fellowSet.add(f));
        targetDoctor.fellowships = Array.from(fellowSet).filter(Boolean);

        // 4. Training
        if (!targetDoctor.training && mTraining) {
          targetDoctor.training = mTraining;
        }

        // 5. Designation & Workplace
        if (!targetDoctor.designation && mDesignation) {
          targetDoctor.designation = mDesignation;
        }
        if (!targetDoctor.workplace && mHospital) {
          targetDoctor.workplace = mHospital;
        }

        // 6. Experience
        if (!targetDoctor.experience && mExperience) {
          targetDoctor.experience = mExperience;
        }

        // 7. Biography
        if (mDoc.biography && (!targetDoctor.biography || targetDoctor.biography.length < 50)) {
          targetDoctor.biography = mDoc.biography;
        }

        // 8. Education & Training array
        if (!targetDoctor.education_training) targetDoctor.education_training = [];
        const eduSet = new Set(targetDoctor.education_training);
        mEduTraining.forEach(e => eduSet.add(e));
        targetDoctor.education_training = Array.from(eduSet);

        // 9. Medical Focus chips
        if (!targetDoctor.medical_focus) targetDoctor.medical_focus = [];
        const focusSet = new Set(targetDoctor.medical_focus);
        mFocus.forEach(f => focusSet.add(f));
        targetDoctor.medical_focus = Array.from(focusSet);

        // 10. Reviews data
        if (mDoc.reviews) {
          targetDoctor.reviews_data = {
            rating: mDoc.reviews.rating || 0,
            review_count: mDoc.reviews.review_count || 0,
            reviews: Array.isArray(mDoc.reviews.reviews) ? mDoc.reviews.reviews : []
          };
          if (!targetDoctor.rating && mDoc.reviews.rating > 0) {
            targetDoctor.rating = mDoc.reviews.rating;
            targetDoctor.reviewCount = mDoc.reviews.review_count || 0;
          }
        }

        // 11. Profile claim
        if (mDoc.profile_claim && !targetDoctor.profile_claim) {
          targetDoctor.profile_claim = mDoc.profile_claim;
        }

        // 12. Source attribution metadata
        targetDoctor.source_metadata = {
          name: 'MedicBD',
          profile_url: mDoc.profile_url,
          last_imported_at: new Date()
        };
        targetDoctor.normalized_name = cleanTitle(targetDoctor.name);

        // 13. Image enrichment: if existing image is missing/default, and MedicBD has custom upload
        if (
          (!targetDoctor.imageUrl || targetDoctor.imageUrl.includes('default-og-image')) &&
          mDoc.image_url &&
          !mDoc.image_url.includes('default-og-image')
        ) {
          targetDoctor.imageUrl = mDoc.image_url;
        }

        // 14. Chambers Deduplication & Merging
        if (!targetDoctor.chambers) targetDoctor.chambers = [];
        mChambers.forEach(mChamber => {
          const mNormChName = cleanChamberName(mChamber.name);
          const existingCh = targetDoctor.chambers.find(ec =>
            cleanChamberName(ec.name) === mNormChName ||
            (ec.address && mChamber.address && normalizePunct(ec.address) === normalizePunct(mChamber.address))
          );

          if (existingCh) {
            // Update existing chamber
            report.existing_chambers_updated++;
            if (!existingCh.visiting_hours && mChamber.visiting_hours) {
              existingCh.visiting_hours = mChamber.visiting_hours;
              existingCh.visiting_hour = mChamber.visiting_hours;
            }
            if (!existingCh.closed_day && mChamber.closed_day) {
              existingCh.closed_day = mChamber.closed_day;
            }
            if (!existingCh.google_map && mChamber.google_map) {
              existingCh.google_map = mChamber.google_map;
            }
            // Merge phones
            const phoneSet = new Set(existingCh.appointment_numbers || []);
            (mChamber.appointment_numbers || []).forEach(p => phoneSet.add(p));
            existingCh.appointment_numbers = Array.from(phoneSet);
            if (!existingCh.appointment && mChamber.appointment) {
              existingCh.appointment = mChamber.appointment;
            }
          } else {
            // Add new chamber
            report.new_chambers_added++;
            targetDoctor.chambers.push(mChamber);
          }
        });

        await targetDoctor.save();
        report.doctors_enriched++;
      } else {
        // CASE B: Doctor Does NOT Exist -> Create New Doctor
        const slug = await generateUniqueSlug(mDoc.name, existingSlugs);

        const newDoctorData = {
          name: mDoc.name,
          slug,
          normalized_name: cleanTitle(mDoc.name),
          source_names: [mDoc.name],
          specialty: mSpecialty,
          specialties: Array.from(new Set([mSpecialty, ...mFocus.filter(f => f.toLowerCase().includes('specialist') || f.toLowerCase().includes('surgeon'))])),
          qualifications: mQualStr || (mDegrees.length > 0 ? mDegrees.join(', ') : 'MBBS'),
          degrees: mDegrees.length > 0 ? mDegrees : ['MBBS'],
          fellowships: mFellowships,
          training: mTraining,
          education_training: mEduTraining,
          medical_focus: mFocus,
          designation: mDesignation || 'Consultant',
          workplace: mHospital || 'Rajshahi Medical College & Hospital',
          experience: mExperience,
          biography: mDoc.biography,
          bmdcRegistration: null,
          verified: false,
          rating: mDoc.reviews?.rating > 0 ? mDoc.reviews.rating : null,
          reviewCount: mDoc.reviews?.review_count || 0,
          reviews_data: {
            rating: mDoc.reviews?.rating || 0,
            review_count: mDoc.reviews?.review_count || 0,
            reviews: Array.isArray(mDoc.reviews?.reviews) ? mDoc.reviews.reviews : []
          },
          profile_claim: mDoc.profile_claim,
          chambers: mChambers,
          imageUrl: mDoc.image_url,
          profileUrl: mDoc.profile_url,
          source: 'MedicBD',
          source_metadata: {
            name: 'MedicBD',
            profile_url: mDoc.profile_url,
            last_imported_at: new Date()
          },
          lastScraped: new Date(),
          city: 'Rajshahi',
          country: 'Bangladesh',
          is_active: true,
          isOutdated: false,
          currency: 'BDT',
          available_for_telemedicine: false
        };

        const createdDoc = await Doctor.create(newDoctorData);
        existingDoctors.push(createdDoc);
        existingByProfileUrl.set(mDoc.profile_url.toLowerCase(), createdDoc);
        report.new_doctors_added++;
        newDoctorData.specialties.forEach(s => allSpecialtiesAfter.add(s));
      }
    } catch (docErr) {
      console.error(`Failed processing doctor record ${i}:`, mDoc.name, docErr.message);
      report.failed_records++;
    }
  }

  report.new_specialties_count = allSpecialtiesAfter.size - allSpecialtiesBefore.size;
  report.duration_ms = Date.now() - startTime;

  // Save Migration Report JSON
  const reportJsonPath = path.join(__dirname, '../../medicbd_import_report.json');
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2));

  // Save Migration Report CSV
  const csvLines = [
    'Metric,Value',
    `Existing doctors initial,${report.total_existing_doctors_initial}`,
    `MedicBD doctors processed,${report.medicbd_records_processed}`,
    `Matched existing doctors,${report.matched_existing_doctors}`,
    `New doctors added,${report.new_doctors_added}`,
    `Doctors enriched,${report.doctors_enriched}`,
    `New chambers added,${report.new_chambers_added}`,
    `Existing chambers updated,${report.existing_chambers_updated}`,
    `Duplicate records prevented,${report.duplicate_records_prevented}`,
    `Possible duplicates requiring review,${report.possible_duplicates_requiring_review.length}`,
    `Failed records,${report.failed_records}`,
    `Total doctors in database after import,${report.total_existing_doctors_initial + report.new_doctors_added}`
  ];
  const reportCsvPath = path.join(__dirname, '../../medicbd_import_report.csv');
  fs.writeFileSync(reportCsvPath, csvLines.join('\n'));

  console.log('\n=====================================================');
  console.log('         MEDICBD IMPORT MIGRATION REPORT');
  console.log('=====================================================');
  console.log(`Existing doctors:                        ${report.total_existing_doctors_initial}`);
  console.log(`MedicBD doctors processed:              ${report.medicbd_records_processed}`);
  console.log(`Matched existing doctors:               ${report.matched_existing_doctors}`);
  console.log(`New doctors added:                      ${report.new_doctors_added}`);
  console.log(`Doctors enriched:                       ${report.doctors_enriched}`);
  console.log(`New chambers added:                     ${report.new_chambers_added}`);
  console.log(`Existing chambers updated:              ${report.existing_chambers_updated}`);
  console.log(`Duplicate records prevented:            ${report.duplicate_records_prevented}`);
  console.log(`Possible duplicates requiring review:   ${report.possible_duplicates_requiring_review.length}`);
  console.log(`Failed records:                         ${report.failed_records}`);
  console.log(`Total doctors now in database:          ${report.total_existing_doctors_initial + report.new_doctors_added}`);
  console.log(`Duration:                               ${(report.duration_ms / 1000).toFixed(2)}s`);
  console.log(`Reports saved to:`);
  console.log(` - ${reportJsonPath}`);
  console.log(` - ${reportCsvPath}`);
  console.log('=====================================================\n');

  await mongoose.disconnect();
}

if (require.main === module) {
  runMigration().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Fatal error during migration:', err);
    process.exit(1);
  });
}

module.exports = runMigration;
