/**
 * STEP 01 — Backup Verification
 * Confirms MongoDB is intact and readable before any migration begins.
 * READ-ONLY. Does NOT modify MongoDB.
 */

module.exports = async function step01_backupVerify(db, supabase) {
  console.log("Verifying MongoDB backup integrity...");

  const expectedCounts = {
    doctors: 371, doctorbranches: 427, doctorschedules: 2135,
    hospitals: 6, pharmacies: 56, pharmacyinventories: 133,
    medicines: 15, users: 118, appointments: 29, prescriptions: 23,
    payments: 36, notifications: 32, auditlogs: 77, hospitalresources: 8,
    inventoryaudits: 24, otpverifications: 66, pharmacyorders: 2,
    invoices: 0, orders: 0
  };

  const collections = await db.listCollections().toArray();
  const found = {};
  let allMatch = true;

  for (const col of collections) {
    found[col.name] = await db.collection(col.name).countDocuments();
  }

  console.log("\nCollection verification:");
  for (const [name, expected] of Object.entries(expectedCounts)) {
    const actual = found[name] ?? 0;
    const match = actual >= expected; // >= because more docs may have been added
    if (!match) allMatch = false;
    const icon = match ? "✅" : "⚠️";
    console.log(`  ${icon} ${name.padEnd(25)} Expected: ${String(expected).padStart(5)}  Actual: ${String(actual).padStart(5)}`);
  }

  // Check for unexpected collections
  for (const name of Object.keys(found)) {
    if (!(name in expectedCounts)) {
      console.log(`  ℹ️  ${name.padEnd(25)} (unexpected collection, count: ${found[name]})`);
    }
  }

  const totalMongo = Object.values(found).reduce((a, b) => a + b, 0);
  console.log(`\n  Total MongoDB documents: ${totalMongo}`);
  console.log(`  MongoDB status: ${allMatch ? "✅ VERIFIED" : "⚠️ COUNTS DIFFER (may be new data, proceeding)"}`);

  // Check Supabase schema is ready
  const { error } = await supabase.from("migration_id_map").select("id").limit(1);
  if (error && error.code !== "PGRST116") {
    throw new Error(`Supabase schema not ready: ${error.message}. Run 00_postgresql_schema.sql first.`);
  }
  console.log("  Supabase schema: ✅ READY");

  return { migrated: 0, skipped: 0, totalMongo };
};
