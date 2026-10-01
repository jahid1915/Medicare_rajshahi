/**
 * Test Supabase Management API endpoints for raw SQL execution
 */
require("dotenv").config();
const https = require("https");

const PROJECT_REF = "ickofuqtxsexxyjenmac";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function httpPost(hostname, path, body, headers) {
  return new Promise((resolve, reject) => {
    const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
    const opts = {
      hostname,
      path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
        ...headers
      }
    };
    const req = https.request(opts, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, body: d }));
    });
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

async function main() {
  const authHeaders = {
    "apikey": SERVICE_KEY,
    "Authorization": "Bearer " + SERVICE_KEY
  };

  // Test 1: Direct query endpoint
  console.log("\nTest 1: /pg/query ...");
  const t1 = await httpPost(
    `${PROJECT_REF}.supabase.co`,
    "/pg/query",
    { query: "SELECT current_database()" },
    authHeaders
  );
  console.log("  Status:", t1.status, "Body:", t1.body.substring(0, 200));

  // Test 2: REST RPC for raw SQL
  console.log("\nTest 2: /rest/v1/rpc/sql ...");
  const t2 = await httpPost(
    `${PROJECT_REF}.supabase.co`,
    "/rest/v1/rpc/sql",
    { query: "SELECT 1" },
    authHeaders
  );
  console.log("  Status:", t2.status, "Body:", t2.body.substring(0, 200));

  // Test 3: Direct DB API
  console.log("\nTest 3: /db/sql ...");
  const t3 = await httpPost(
    `${PROJECT_REF}.supabase.co`,
    "/db/sql",
    "SELECT 1 as test",
    authHeaders
  );
  console.log("  Status:", t3.status, "Body:", t3.body.substring(0, 200));

  // Test 4: Management API SQL (needs personal access token, but let's try)
  console.log("\nTest 4: api.supabase.com/v1/projects/.../database/query ...");
  const t4 = await httpPost(
    "api.supabase.com",
    `/v1/projects/${PROJECT_REF}/database/query`,
    { query: "SELECT current_database()" },
    { "Authorization": "Bearer " + SERVICE_KEY }
  );
  console.log("  Status:", t4.status, "Body:", t4.body.substring(0, 300));
}

main().catch(console.error);
