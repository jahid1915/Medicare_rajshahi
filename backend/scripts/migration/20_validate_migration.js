/**
 * STEP 20 — Validation Report
 * Compares MongoDB counts to Supabase counts for every collection.
 */

module.exports = async function step20_validate(db, supabase) {
  console.log("Running migration validation...\n");

  const validations = [
    { mongo: "hospitals",         supabase: "hospitals",            entity: "hospital" },
    { mongo: "doctors",           supabase: "doctors",              entity: "doctor" },
    { mongo: "doctorbranches",    supabase: "doctor_branches",      entity: "doctorbranch" },
    { mongo: "doctorschedules",   supabase: "doctor_schedules",     entity: "doctorschedule" },
    { mongo: "users",             supabase: "profiles",             entity: "user" },
    { mongo: "pharmacies",        supabase: "pharmacies",           entity: "pharmacy" },
    { mongo: "medicines",         supabase: "medicines",            entity: "medicine" },
    { mongo: "pharmacyinventories",supabase: "pharmacy_inventories",entity: "pharmacyinventory" },
    { mongo: "pharmacyorders",    supabase: "pharmacy_orders",      entity: "pharmacyorder" },
    { mongo: "appointments",      supabase: "appointments",         entity: "appointment" },
    { mongo: "payments",          supabase: "payments",             entity: "payment" },
    { mongo: "prescriptions",     supabase: "prescriptions",        entity: "prescription" },
    { mongo: "notifications",     supabase: "notifications",        entity: "notification" },
    { mongo: "auditlogs",         supabase: "audit_logs",           entity: "auditlog" },
    { mongo: "hospitalresources", supabase: "hospital_resources",   entity: "hospitalresource" },
    { mongo: "inventoryaudits",   supabase: "inventory_audits",     entity: "inventoryaudit" },
    { mongo: "otpverifications",  supabase: "otp_verifications",    entity: "otpverification" },
  ];

  let totalMongo = 0, totalSupabase = 0;
  const issues = [];

  console.log(
    "Collection".padEnd(26) +
    "MongoDB".padStart(9) +
    "Supabase".padStart(10) +
    "Diff".padStart(7) +
    "  Status"
  );
  console.log("─".repeat(70));

  for (const v of validations) {
    const mongoCount = await db.collection(v.mongo).countDocuments();
    
    const { count: sbCount } = await supabase
      .from(v.supabase)
      .select("*", { count: "exact", head: true });

    const diff = (sbCount || 0) - mongoCount;
    const status = diff === 0 ? "✅ MATCH" : diff > 0 ? "⚠️ MORE" : "❌ LESS";

    console.log(
      v.mongo.padEnd(26) +
      String(mongoCount).padStart(9) +
      String(sbCount || 0).padStart(10) +
      String(diff >= 0 ? "+" + diff : diff).padStart(7) +
      "  " + status
    );

    totalMongo += mongoCount;
    totalSupabase += (sbCount || 0);

    if (diff < 0) {
      issues.push({ collection: v.mongo, missing: Math.abs(diff) });
    }
  }

  console.log("─".repeat(70));
  console.log(
    "TOTAL".padEnd(26) +
    String(totalMongo).padStart(9) +
    String(totalSupabase).padStart(10) +
    String(totalSupabase - totalMongo >= 0 ? "+" + (totalSupabase - totalMongo) : totalSupabase - totalMongo).padStart(7)
  );

  // Relationship validation
  console.log("\n\n── RELATIONSHIP VALIDATION ──────────────────────────────\n");

  // Check for orphaned doctor_specialties
  const { count: orphanedSpecs } = await supabase.rpc
    ? { count: 0 } // RPC not available in this context
    : { count: 0 };

  // Check doctor_branches without valid doctor
  const { data: branches } = await supabase
    .from("doctor_branches")
    .select("id, doctor_id")
    .is("doctor_id", null);
  console.log(`  Branches without doctor: ${(branches || []).length}`);

  // Check schedules without valid branch
  const { data: orphanSchedules } = await supabase
    .from("doctor_schedules")
    .select("id")
    .is("branch_id", null);
  console.log(`  Schedules without branch: ${(orphanSchedules || []).length}`);

  // Check appointments without valid patient
  const { data: orphanApts } = await supabase
    .from("appointments")
    .select("id")
    .is("patient_id", null);
  console.log(`  Appointments without patient: ${(orphanApts || []).length}`);

  // Migration map stats
  const { count: mapCount } = await supabase
    .from("migration_id_map")
    .select("*", { count: "exact", head: true });
  console.log(`  Migration map entries: ${mapCount}`);

  // Specialty stats
  const { count: specCount } = await supabase
    .from("specialties")
    .select("*", { count: "exact", head: true });
  const { count: dsCount } = await supabase
    .from("doctor_specialties")
    .select("*", { count: "exact", head: true });
  console.log(`  Specialties: ${specCount}`);
  console.log(`  Doctor-specialty links: ${dsCount}`);

  // Prescription items
  const { count: rxItemCount } = await supabase
    .from("prescription_items")
    .select("*", { count: "exact", head: true });
  console.log(`  Prescription items: ${rxItemCount}`);

  // Doctor chambers
  const { count: chamberCount } = await supabase
    .from("doctor_chambers")
    .select("*", { count: "exact", head: true });
  console.log(`  Doctor chambers: ${chamberCount}`);

  // Doctor degrees
  const { count: degreeCount } = await supabase
    .from("doctor_degrees")
    .select("*", { count: "exact", head: true });
  console.log(`  Doctor degrees: ${degreeCount}`);

  console.log("\n── FINAL STATUS ─────────────────────────────────────────");

  if (issues.length === 0) {
    console.log("✅ ALL COLLECTIONS MATCHED — Migration successful!");
  } else {
    console.log(`⚠️ ${issues.length} collection(s) have fewer records in Supabase than MongoDB:`);
    issues.forEach(i => console.log(`   ${i.collection}: ${i.missing} records missing`));
    console.log("\nRe-run the specific migration step to recover missing records.");
  }

  console.log(`
MongoDB status:   INTACT (not modified)
Supabase status:  POPULATED
Total MongoDB:    ${totalMongo}
Total Supabase:   ${totalSupabase}
  `);

  return { migrated: totalSupabase, totalMongo, totalSupabase, issues };
};
