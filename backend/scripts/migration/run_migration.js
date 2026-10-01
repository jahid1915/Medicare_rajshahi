/**
 * Migration Runner — Niramoy MongoDB → Supabase
 * ─────────────────────────────────────────────
 * Usage:
 *   node scripts/migration/run_migration.js
 *   node scripts/migration/run_migration.js --step 03  (run single step)
 *   node scripts/migration/run_migration.js --from 05  (resume from step)
 *   node scripts/migration/run_migration.js --validate  (validation only)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://ickofuqtxsexxyjenmac.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MONGO_URI = process.env.MONGO_URI;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is required. Add it to backend/.env");
  process.exit(1);
}

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is required in backend/.env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Migration steps in order
const STEPS = [
  { id: "01", name: "Backup Verification", file: "./01_backup_verify" },
  { id: "02", name: "Hospitals",           file: "./02_migrate_hospitals" },
  { id: "03", name: "Specialties",         file: "./03_migrate_specialties" },
  { id: "04", name: "Doctors",             file: "./04_migrate_doctors" },
  { id: "05", name: "Doctor Branches",     file: "./05_migrate_branches" },
  { id: "06", name: "Doctor Schedules",    file: "./06_migrate_schedules" },
  { id: "07", name: "Users/Profiles",      file: "./07_migrate_users" },
  { id: "08", name: "Pharmacies",          file: "./08_migrate_pharmacies" },
  { id: "09", name: "Medicines",           file: "./09_migrate_medicines" },
  { id: "10", name: "Pharmacy Inventory",  file: "./10_migrate_inventory" },
  { id: "11", name: "Pharmacy Orders",     file: "./11_migrate_pharmacy_orders" },
  { id: "12", name: "Appointments",        file: "./12_migrate_appointments" },
  { id: "13", name: "Payments",            file: "./13_migrate_payments" },
  { id: "14", name: "Prescriptions",       file: "./14_migrate_prescriptions" },
  { id: "15", name: "Notifications",       file: "./15_migrate_notifications" },
  { id: "16", name: "Audit Logs",          file: "./16_migrate_auditlogs" },
  { id: "17", name: "Hospital Resources",  file: "./17_migrate_hospital_resources" },
  { id: "18", name: "Inventory Audits",    file: "./18_migrate_inventory_audits" },
  { id: "19", name: "OTP Records",         file: "./19_migrate_otp" },
  { id: "20", name: "Validation",          file: "./20_validate_migration" },
];

async function run() {
  const args = process.argv.slice(2);
  const stepArg = args.find(a => a.startsWith("--step="))?.split("=")[1];
  const fromArg = args.find(a => a.startsWith("--from="))?.split("=")[1];
  const validateOnly = args.includes("--validate");

  console.log(`
╔══════════════════════════════════════════════════════╗
║   NIRAMOY — MongoDB → Supabase Migration Runner      ║
║   Target: ${SUPABASE_URL.split(".")[0].replace("https://","").padEnd(40)}║
╚══════════════════════════════════════════════════════╝
`);

  // Connect MongoDB
  console.log("📡 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  console.log(`✅ MongoDB connected: ${db.databaseName}\n`);

  // Test Supabase connection
  console.log("📡 Testing Supabase connection...");
  const { data: testData, error: testError } = await supabase
    .from("migration_id_map")
    .select("id")
    .limit(1);
  
  if (testError && testError.code !== "PGRST116") {
    console.error("❌ Supabase connection failed:", testError.message);
    console.error("   Make sure you ran 00_postgresql_schema.sql in Supabase SQL Editor first.");
    process.exit(1);
  }
  console.log("✅ Supabase connected\n");

  // Determine which steps to run
  let stepsToRun = STEPS;
  if (validateOnly) {
    stepsToRun = STEPS.filter(s => s.id === "20");
  } else if (stepArg) {
    stepsToRun = STEPS.filter(s => s.id === stepArg);
  } else if (fromArg) {
    const fromIdx = STEPS.findIndex(s => s.id === fromArg);
    stepsToRun = fromIdx >= 0 ? STEPS.slice(fromIdx) : STEPS;
  }

  const results = [];

  for (const step of stepsToRun) {
    console.log(`\n${"─".repeat(55)}`);
    console.log(`STEP ${step.id}: ${step.name}`);
    console.log("─".repeat(55));
    
    try {
      const migrator = require(step.file);
      const result = await migrator(db, supabase);
      results.push({ step: step.id, name: step.name, status: "✅ PASS", ...result });
    } catch (err) {
      console.error(`❌ Step ${step.id} FAILED:`, err.message);
      results.push({ step: step.id, name: step.name, status: "❌ FAIL", error: err.message });
      
      // Don't continue if critical steps fail
      if (["02","04","07","08","09"].includes(step.id)) {
        console.error("Critical step failed. Stopping migration.");
        break;
      }
    }
  }

  // Summary
  console.log(`\n${"═".repeat(55)}`);
  console.log("MIGRATION SUMMARY");
  console.log("═".repeat(55));
  for (const r of results) {
    const detail = r.migrated != null ? ` (${r.migrated} migrated, ${r.skipped || 0} skipped)` : "";
    console.log(`${r.status} Step ${r.step}: ${r.name}${detail}`);
    if (r.error) console.log(`          Error: ${r.error}`);
  }
  console.log("═".repeat(55));

  await mongoose.disconnect();
  console.log("\n✅ Migration runner complete. MongoDB NOT modified.");
}

run().catch(err => {
  console.error("Fatal error:", err);
  mongoose.disconnect().catch(() => {});
  process.exit(1);
});
