/**
 * Execute PostgreSQL Schema in Supabase via Management API
 * Runs 00_postgresql_schema.sql directly without needing the SQL Editor.
 */

require("dotenv").config();
const https = require("https");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];

const schemaSQL = fs.readFileSync(
  path.join(__dirname, "00_postgresql_schema.sql"),
  "utf8"
);

async function executeSQL(sql, description) {
  return new Promise((resolve, reject) => {
    // Use Supabase's pg endpoint via REST
    const body = JSON.stringify({ query: sql });
    
    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: "/rest/v1/rpc/exec_sql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Length": Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function executeViaQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(sql);
    const options = {
      hostname: `db.${projectRef}.supabase.co`,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`
      }
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Split SQL into executable chunks (by semicolon, handling $$ blocks)
function splitSQL(sql) {
  const statements = [];
  let current = "";
  let inDollarBlock = false;
  
  const lines = sql.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("--")) {
      continue; // skip comments
    }
    
    if (trimmed.includes("$$")) {
      const count = (trimmed.match(/\$\$/g) || []).length;
      if (count % 2 === 1) inDollarBlock = !inDollarBlock;
    }
    
    current += line + "\n";
    
    if (!inDollarBlock && trimmed.endsWith(";")) {
      const stmt = current.trim();
      if (stmt && stmt !== ";") {
        statements.push(stmt);
      }
      current = "";
    }
  }
  if (current.trim()) statements.push(current.trim());
  
  return statements.filter(s => s.length > 2);
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   Executing PostgreSQL Schema in Supabase            ║");
  console.log(`║   Project: ${projectRef.padEnd(40)}║`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  // Try using the Supabase JS client with rpc for raw SQL
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Split into statements
  const statements = splitSQL(schemaSQL);
  console.log(`Schema has ${statements.length} SQL statements to execute\n`);

  let succeeded = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\n/g, " ").trim();
    
    try {
      // Use Supabase's pg API via direct HTTP
      const result = await new Promise((resolve, reject) => {
        const body = JSON.stringify({ query: stmt });
        const options = {
          hostname: `${projectRef}.supabase.co`,
          path: "/rest/v1/rpc/exec_sql",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SERVICE_KEY,
            "Authorization": `Bearer ${SERVICE_KEY}`,
            "Content-Length": Buffer.byteLength(body),
            "Prefer": "return=minimal"
          }
        };
        const req = https.request(options, (res) => {
          let data = "";
          res.on("data", chunk => data += chunk);
          res.on("end", () => resolve({ status: res.statusCode, body: data }));
        });
        req.on("error", reject);
        req.write(body);
        req.end();
      });

      if (result.status >= 200 && result.status < 300) {
        succeeded++;
        process.stdout.write(`\r  [${i+1}/${statements.length}] ✅ ${preview.substring(0,60)}...`);
      } else {
        // Try to detect if it's a benign error (already exists, etc.)
        const errBody = result.body;
        if (errBody.includes("already exists") || errBody.includes("duplicate") || result.status === 409) {
          succeeded++;
          process.stdout.write(`\r  [${i+1}/${statements.length}] ⏭ Already exists: ${preview.substring(0,50)}...`);
        } else {
          failed++;
          errors.push({ statement: preview, error: errBody.substring(0, 200) });
          process.stdout.write(`\r  [${i+1}/${statements.length}] ⚠️ ${result.status}: ${errBody.substring(0,50)}...`);
        }
      }
    } catch (err) {
      failed++;
      errors.push({ statement: preview, error: err.message });
    }
  }

  console.log(`\n\nResults: ${succeeded} succeeded, ${failed} failed`);
  
  if (errors.length > 0) {
    console.log("\nFailed statements:");
    errors.slice(0, 5).forEach(e => {
      console.log(`  ❌ ${e.statement}`);
      console.log(`     ${e.error}`);
    });
  }

  // Verify by checking if migration_id_map exists
  console.log("\nVerifying schema creation...");
  const { data, error } = await supabase
    .from("migration_id_map")
    .select("id")
    .limit(1);
  
  if (!error || error.code === "PGRST116") {
    console.log("✅ Schema verified — migration_id_map table exists!");
    console.log("\nReady to run: npm run migrate");
  } else {
    console.log("⚠️ Schema verification result:", error?.message);
    console.log("\nIf exec_sql RPC is not available, please run 00_postgresql_schema.sql");
    console.log("manually in Supabase Dashboard → SQL Editor");
  }
}

main().catch(console.error);
