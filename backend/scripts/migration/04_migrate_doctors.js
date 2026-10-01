/**
 * STEP 04 — Migrate Doctors (371 documents)
 * Migrates core doctor records + specialties + degrees + chambers.
 * Idempotent: uses legacy_mongodb_id.
 */

const BATCH_SIZE = 50;

module.exports = async function step04_doctors(db, supabase) {
  const total = await db.collection("doctors").countDocuments();
  console.log(`Found ${total} doctors in MongoDB`);

  // Load specialty map from Supabase
  const { data: specRows } = await supabase.from("specialties").select("id, name");
  const specMap = {};
  for (const s of (specRows || [])) {
    specMap[s.name.toLowerCase().trim()] = s.id;
  }
  console.log(`Loaded ${Object.keys(specMap).length} specialties from Supabase`);

  let migrated = 0, skipped = 0, failed = 0;
  let offset = 0;

  while (offset < total) {
    const batch = await db.collection("doctors")
      .find({})
      .skip(offset)
      .limit(BATCH_SIZE)
      .toArray();

    for (const d of batch) {
      const mongoId = d._id.toString();

      // Idempotency check
      const { data: existing } = await supabase
        .from("migration_id_map")
        .select("supabase_id")
        .eq("entity_type", "doctor")
        .eq("mongodb_id", mongoId)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // Build doctor row
      const row = {
        legacy_mongodb_id:          mongoId,
        name:                       d.name,
        slug:                       d.slug || d.name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") + "-" + mongoId.slice(-4),
        normalized_name:            d.normalized_name || null,
        source_names:               d.source_names || [],
        specialty:                  d.specialty || "General Practice",
        qualifications:             d.qualifications || null,
        training:                   d.training || null,
        education_training:         d.education_training || [],
        fellowships:                d.fellowships || [],
        medical_focus:              d.medical_focus || [],
        designation:                d.designation || null,
        workplace:                  d.workplace || null,
        experience:                 d.experience || null,
        biography:                  d.biography || null,
        bmdc_registration:          d.bmdcRegistration || null,
        verified:                   d.verified || false,
        rating:                     d.rating != null ? Number(d.rating) : null,
        review_count:               d.reviewCount || 0,
        reviews_data:               d.reviews_data || {},
        profile_claim:              d.profile_claim || null,
        image_url:                  d.imageUrl || null,
        profile_url:                d.profileUrl || null,
        source:                     d.source || "BDDoctorDirectory",
        source_metadata:            d.source_metadata || {},
        last_scraped:               d.lastScraped ? new Date(d.lastScraped).toISOString() : null,
        city:                       d.city || "Rajshahi",
        country:                    d.country || "Bangladesh",
        is_active:                  d.is_active !== false,
        is_outdated:                d.isOutdated || false,
        admin_notes:                d.adminNotes || null,
        consultation_fee:           d.consultation_fee || null,
        currency:                   d.currency || "BDT",
        available_for_telemedicine: d.available_for_telemedicine || false,
        created_at:                 d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        updated_at:                 d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
      };

      const { data: inserted, error } = await supabase
        .from("doctors")
        .insert(row)
        .select("id")
        .single();

      if (error) {
        // Handle duplicate slug
        if (error.code === "23505" && error.message.includes("slug")) {
          row.slug = row.slug + "-" + mongoId.slice(-6);
          const { data: retry, error: retryErr } = await supabase
            .from("doctors").insert(row).select("id").single();
          if (retryErr) {
            console.error(`  ❌ Failed: ${d.name} — ${retryErr.message}`);
            failed++;
            continue;
          }
          inserted.id = retry.id;
        } else {
          console.error(`  ❌ Failed: ${d.name} — ${error.message}`);
          failed++;
          continue;
        }
      }

      const doctorSupabaseId = inserted?.id || (await supabase.from("doctors").select("id").eq("legacy_mongodb_id", mongoId).single()).data?.id;

      // Record mapping
      await supabase.from("migration_id_map").insert({
        entity_type: "doctor",
        mongodb_id: mongoId,
        supabase_id: doctorSupabaseId
      });

      // ── Doctor Specialties ──────────────────────────────────
      const allSpecialties = [];
      if (d.specialty && d.specialty.trim()) {
        const specId = specMap[d.specialty.toLowerCase().trim()];
        if (specId) allSpecialties.push({ doctor_id: doctorSupabaseId, specialty_id: specId, is_primary: true });
      }
      if (Array.isArray(d.specialties)) {
        for (const s of d.specialties) {
          if (!s?.trim()) continue;
          const specId = specMap[s.toLowerCase().trim()];
          if (specId && !allSpecialties.find(x => x.specialty_id === specId)) {
            allSpecialties.push({ doctor_id: doctorSupabaseId, specialty_id: specId, is_primary: false });
          }
        }
      }
      if (allSpecialties.length > 0) {
        await supabase.from("doctor_specialties").upsert(allSpecialties, {
          onConflict: "doctor_id,specialty_id", ignoreDuplicates: true
        });
      }

      // ── Doctor Degrees ──────────────────────────────────────
      const degreeRows = [];
      if (Array.isArray(d.degrees)) {
        d.degrees.forEach((deg, i) => {
          if (deg?.trim()) {
            degreeRows.push({ doctor_id: doctorSupabaseId, degree: deg.trim(), display_order: i });
          }
        });
      }
      if (degreeRows.length > 0) {
        await supabase.from("doctor_degrees").insert(degreeRows);
      }

      // ── Doctor Chambers ─────────────────────────────────────
      if (Array.isArray(d.chambers) && d.chambers.length > 0) {
        const chamberRows = d.chambers.map((c, i) => ({
          doctor_id:          doctorSupabaseId,
          name:               c.name || null,
          address:            c.address || null,
          visiting_hours:     c.visiting_hours || null,
          visiting_hour:      c.visiting_hour || null,
          closed_day:         c.closed_day || null,
          appointment:        c.appointment || null,
          appointment_numbers:c.appointment_numbers || [],
          google_map:         c.google_map || null,
          display_order:      i
        }));
        await supabase.from("doctor_chambers").insert(chamberRows);
      }

      migrated++;
      if (migrated % 50 === 0) {
        process.stdout.write(`\r  Progress: ${migrated}/${total - skipped - failed} doctors migrated...`);
      }
    }

    offset += BATCH_SIZE;
  }

  console.log(`\nDoctors: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
