/**
 * STEP 07 — Migrate Users/Profiles (118 documents)
 * 
 * IMPORTANT: This migrates users into the `profiles` table WITHOUT creating
 * Supabase Auth accounts. The existing JWT-based authentication is preserved.
 * Server continues issuing JWTs using existing password hashes stored in profiles.
 * 
 * Supabase Auth integration can be done as a separate phase if needed.
 */

module.exports = async function step07_users(db, supabase) {
  const total = await db.collection("users").countDocuments();
  console.log(`Found ${total} users in MongoDB`);
  console.log("NOTE: Migrating to profiles table (NOT Supabase Auth — JWT auth preserved)");

  let migrated = 0, skipped = 0, failed = 0;

  const users = await db.collection("users").find({}).toArray();

  for (const u of users) {
    const mongoId = u._id.toString();

    // Idempotency check
    const { data: existing } = await supabase
      .from("migration_id_map")
      .select("supabase_id")
      .eq("entity_type", "user")
      .eq("mongodb_id", mongoId)
      .single();

    if (existing) { skipped++; continue; }

    // Resolve hospital and pharmacy FKs if present
    let hospitalSupabaseId = null;
    if (u.hospital_id) {
      const { data: hMap } = await supabase
        .from("migration_id_map")
        .select("supabase_id")
        .eq("entity_type", "hospital")
        .eq("mongodb_id", u.hospital_id.toString())
        .single();
      hospitalSupabaseId = hMap?.supabase_id || null;
    }

    let pharmacySupabaseId = null;
    if (u.pharmacy_id) {
      const { data: pMap } = await supabase
        .from("migration_id_map")
        .select("supabase_id")
        .eq("entity_type", "pharmacy")
        .eq("mongodb_id", u.pharmacy_id.toString())
        .single();
      pharmacySupabaseId = pMap?.supabase_id || null;
    }

    const row = {
      legacy_mongodb_id:            mongoId,
      name:                         u.name || "Patient",
      email:                        u.email || null,
      phone:                        u.phone || null,
      password_hash:                u.password || null,   // bcrypt hash, preserved for JWT auth
      role:                         u.role || "patient",
      date_of_birth:                u.date_of_birth ? new Date(u.date_of_birth).toISOString().split("T")[0] : null,
      gender:                       u.gender || null,
      address:                      u.address || null,
      blood_group:                  u.blood_group || null,
      profile_picture:              u.profile_picture || null,
      preferred_language:           u.preferred_language || "bn",
      emergency_contact:            u.emergency_contact || null,
      emergency_contact_name:       u.emergency_contact_name || null,
      emergency_contact_relation:   u.emergency_contact_relation || null,
      emergency_contact_phone:      u.emergency_contact_phone || null,
      allergies:                    u.allergies || "",
      existing_conditions:          u.existing_conditions || "",
      previous_surgeries:           u.previous_surgeries || "",
      current_medications:          u.current_medications || "",
      medical_history:              u.medical_history || "",
      hospital_id:                  hospitalSupabaseId,
      pharmacy_id:                  pharmacySupabaseId,
      is_active:                    u.is_active !== false,
      is_verified:                  u.is_verified || false,
      is_email_verified:            u.is_email_verified || false,
      last_login:                   u.last_login ? new Date(u.last_login).toISOString() : null,
      created_at:                   u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      updated_at:                   u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("profiles")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") { // unique violation (email/phone already exists)
        console.warn(`  ⚠️ Duplicate: ${u.email || u.phone} — ${error.message}`);
        skipped++;
      } else {
        console.error(`  ❌ Failed: ${u.email || u.phone} — ${error.message}`);
        failed++;
      }
      continue;
    }

    await supabase.from("migration_id_map").insert({
      entity_type: "user",
      mongodb_id: mongoId,
      supabase_id: inserted.id
    });

    migrated++;
    if (migrated % 20 === 0) {
      process.stdout.write(`\r  Progress: ${migrated} users migrated...`);
    }
  }

  // Role distribution
  const { data: roles } = await supabase
    .from("profiles")
    .select("role");
  
  const roleDist = {};
  (roles || []).forEach(r => { roleDist[r.role] = (roleDist[r.role] || 0) + 1; });
  console.log("\n  Role distribution in Supabase profiles:");
  Object.entries(roleDist).sort(([,a],[,b]) => b - a).forEach(([r, c]) => {
    console.log(`    ${r.padEnd(25)} ${c}`);
  });

  console.log(`\nUsers: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
  return { migrated, skipped, failed };
};
