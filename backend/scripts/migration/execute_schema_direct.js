/**
 * Connect to Supabase PostgreSQL via direct pg connection and execute schema
 */
require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const PROJECT_REF = "ickofuqtxsexxyjenmac";
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const DB_HOST = process.env.SUPABASE_DB_HOST || "aws-0-ap-south-1.pooler.supabase.com";
const DB_PORT = parseInt(process.env.SUPABASE_DB_PORT || "6543");
const DB_USER = process.env.SUPABASE_DB_USER || `postgres.${PROJECT_REF}`;
const DB_NAME = process.env.SUPABASE_DB_NAME || "postgres";

// Confirmed working config (ap-south-1 / Mumbai)
const CONFIGS = [
  { label: "Transaction pooler ap-south-1 (6543)", host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, ssl: { rejectUnauthorized: false } },
  { label: "Session pooler ap-south-1 (5432)",     host: DB_HOST, port: 5432,    user: DB_USER, password: DB_PASSWORD, database: DB_NAME, ssl: { rejectUnauthorized: false } },
];

async function tryConnect(cfg) {
  const { label, ...connOpts } = cfg;
  const client = new Client({ ...connOpts, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    const res = await client.query("SELECT current_database(), current_user");
    console.log(`✅ ${label}`);
    console.log(`   DB: ${res.rows[0].current_database}, User: ${res.rows[0].current_user}`);
    return client;
  } catch (e) {
    console.log(`❌ ${label} — ${e.message.substring(0, 100)}`);
    try { await client.end(); } catch {}
    return null;
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   Supabase Direct PostgreSQL — Schema Executor       ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");
  console.log(`Host: ${DB_HOST}`);
  console.log(`User: ${DB_USER}`);
  console.log(`Pass: ${DB_PASSWORD ? "***" + DB_PASSWORD.slice(-4) : "MISSING"}\n`);

  let client = null;
  for (const cfg of CONFIGS) {
    client = await tryConnect(cfg);
    if (client) break;
  }

  if (!client) {
    console.error("\n❌ All connection attempts failed.");
    console.error("Please check the DB password and try again.");
    process.exit(1);
  }

  // ── Execute Schema ────────────────────────────────────────────────
  console.log("\n📄 Reading schema file...");
  const schemaPath = path.join(__dirname, "00_postgresql_schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  console.log(`   Size: ${(schema.length / 1024).toFixed(1)} KB\n`);

  console.log("🚀 Executing PostgreSQL schema (this will take ~10s)...\n");

  try {
    await client.query(schema);
    console.log("✅ Schema executed successfully!\n");
  } catch (err) {
    if (err.message.includes("already exists") || err.message.includes("duplicate")) {
      console.log("⚠️  Some objects already exist — schema is idempotent (OK)\n");
    } else {
      console.error("❌ Schema error:", err.message);
      // Try statement by statement for better error reporting
      console.log("\n🔄 Retrying statement-by-statement...");
      await executeByStatements(client, schema);
    }
  }

  // ── Verify Tables Created ─────────────────────────────────────────
  console.log("🔍 Verifying tables...\n");
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = result.rows.map(r => r.table_name);
    const expectedTables = [
      "migration_id_map", "profiles", "hospitals", "specialties",
      "doctors", "doctor_specialties", "doctor_degrees", "doctor_chambers",
      "doctor_branches", "doctor_schedules", "pharmacies", "medicines",
      "pharmacy_inventories", "pharmacy_orders", "pharmacy_order_items",
      "appointments", "payments", "prescriptions", "prescription_items",
      "notifications", "otp_verifications", "audit_logs",
      "inventory_audits", "hospital_resources", "invoices", "orders"
    ];

    console.log(`Tables in Supabase (${tables.length}):`);
    for (const t of expectedTables) {
      const found = tables.includes(t);
      console.log(`  ${found ? "✅" : "❌"} ${t}`);
    }

    const missing = expectedTables.filter(t => !tables.includes(t));
    if (missing.length === 0) {
      console.log("\n✅ ALL TABLES CREATED SUCCESSFULLY!");
      console.log("\n🚀 Schema is ready. You can now run the data migration:");
      console.log("   cd d:\\Medi\\backend");
      console.log("   npm run migrate");
    } else {
      console.log(`\n⚠️ Missing ${missing.length} tables: ${missing.join(", ")}`);
    }
  } catch (err) {
    console.error("Verification error:", err.message);
  }

  await client.end();
}

async function executeByStatements(client, sql) {
  // Simple statement splitter (handles $$ blocks)
  const stmts = [];
  let cur = "";
  let inDollar = false;

  for (const line of sql.split("\n")) {
    if (line.trim().startsWith("--")) continue;
    const dollarCount = (line.match(/\$\$/g) || []).length;
    if (dollarCount % 2 === 1) inDollar = !inDollar;
    cur += line + "\n";
    if (!inDollar && line.trim().endsWith(";")) {
      if (cur.trim().length > 2) stmts.push(cur.trim());
      cur = "";
    }
  }

  let ok = 0, skip = 0, fail = 0;
  for (let i = 0; i < stmts.length; i++) {
    const stmt = stmts[i];
    try {
      await client.query(stmt);
      ok++;
      process.stdout.write(`\r  [${i+1}/${stmts.length}] ✅ ${ok} ok, ${skip} skipped, ${fail} failed`);
    } catch (e) {
      if (e.message.includes("already exists") || e.message.includes("duplicate")) {
        skip++;
        process.stdout.write(`\r  [${i+1}/${stmts.length}] ✅ ${ok} ok, ${skip} skipped, ${fail} failed`);
      } else {
        fail++;
        console.error(`\n  ❌ [${i+1}] ${stmt.substring(0, 80)}`);
        console.error(`     Error: ${e.message}`);
      }
    }
  }
  console.log(`\n  Final: ${ok} ok, ${skip} skipped, ${fail} failed`);
}

main().catch(console.error);
