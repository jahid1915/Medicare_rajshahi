/**
 * STEP 02 — Migrate Hospitals (6 documents)
 * Idempotent: uses legacy_mongodb_id to avoid duplicates.
 */

module.exports = async function step02_hospitals(db, supabase) {
  const hospitals = await db.collection("hospitals").find({}).toArray();
  console.log(`Found ${hospitals.length} hospitals in MongoDB`);

  let migrated = 0, skipped = 0, failed = 0;

  for (const h of hospitals) {
    const mongoId = h._id.toString();

    // Check if already migrated
    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "hospital")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) {
      console.log(`  ⏭ Skip (already migrated): ${h.name}`);
      skipped++;
      continue;
    }

    const row = {
      name:               h.name,
      short_name:         h.short_name || null,
      type:               h.type,
      city:               h.city || "Rajshahi",
      district:           h.district || "Rajshahi",
      division:           h.division || "Rajshahi",
      area:               h.area || null,
      address:            h.address || null,
      latitude:           h.latitude || null,
      longitude:          h.longitude || null,
      phone:              h.phone || null,
      emergency_phone:    h.emergency_phone || null,
      email:              h.email || null,
      website:            h.website || null,
      is_verified:        h.is_verified || false,
      verification_level: h.verification_level || "unverified",
      verified_at:        h.verified_at ? new Date(h.verified_at).toISOString() : null,
      has_icu:            h.has_icu || false,
      has_ccu:            h.has_ccu || false,
      has_nicu:           h.has_nicu || false,
      has_picu:           h.has_picu || false,
      has_emergency:      h.has_emergency || false,
      has_blood_bank:     h.has_blood_bank || false,
      has_pharmacy:       h.has_pharmacy || false,
      has_diagnostic:     h.has_diagnostic || false,
      has_ambulance:      h.has_ambulance || false,
      has_dialysis:       h.has_dialysis || false,
      bed_count_approx:   h.bed_count_approx || null,
      services:           h.services || [],
      description:        h.description || null,
      is_active:          h.is_active !== false,
      legacy_mongodb_id:  mongoId,
      created_at:         h.createdAt ? new Date(h.createdAt).toISOString() : new Date().toISOString(),
      updated_at:         h.updatedAt ? new Date(h.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("hospitals")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      console.error(`  ❌ Failed: ${h.name} — ${error.message}`);
      failed++;
      continue;
    }

    // Record in migration map
    await supabase.from("migration_id_map").insert({
      entity_type: "hospital",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    console.log(`  ✅ Migrated: ${h.name} → ${inserted.id}`);
    migrated++;
  }

  console.log(`\nHospitals: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
