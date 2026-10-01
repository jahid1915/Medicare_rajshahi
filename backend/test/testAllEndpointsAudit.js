const http = require("http");

const BASE = "http://localhost:5000";

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const reqOptions = {
      method: options.method || "GET",
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Accept": "application/json",
        ...(options.headers || {})
      }
    };

    if (options.body && typeof options.body === "object") {
      reqOptions.headers["Content-Type"] = "application/json";
    }

    const req = http.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json
        });
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runAudit() {
  console.log("====================================================================");
  console.log("   NIRAMOY COMPREHENSIVE ENDPOINT AUDIT & SECURITY VERIFICATION     ");
  console.log("====================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health & Security Headers
  console.log("1. Checking Server Health & Production Security Headers...");
  const healthRes = await request("/api/health");
  assert(healthRes.status === 200, `Health check returned HTTP ${healthRes.status}`);
  assert(healthRes.body.status === "UP", `Health status is UP (${healthRes.body.status})`);
  assert(healthRes.headers["x-content-type-options"] === "nosniff", "X-Content-Type-Options: nosniff header present");
  assert(healthRes.headers["strict-transport-security"] !== undefined, "Strict-Transport-Security (HSTS) header present");
  assert(healthRes.headers["content-security-policy"] !== undefined, "Content-Security-Policy (CSP) header present");
  assert(healthRes.headers["referrer-policy"] === "strict-origin-when-cross-origin", "Referrer-Policy header present");

  // 2. API Root & Route Map
  console.log("\n2. Checking API Discovery Endpoint...");
  const apiRes = await request("/api");
  assert(apiRes.status === 200, `GET /api returned HTTP ${apiRes.status}`);
  assert(Array.isArray(apiRes.body.availableRoutes) && apiRes.body.availableRoutes.length >= 8, "API reports available routes");

  // 3. Doctors Endpoints
  console.log("\n3. Checking Doctor Endpoints...");
  const docListRes = await request("/api/doctors?limit=5");
  assert(docListRes.status === 200, `GET /api/doctors returned HTTP ${docListRes.status}`);
  assert(Array.isArray(docListRes.body.data) && docListRes.body.data.length > 0, `Returned ${docListRes.body.data?.length} doctors`);

  const sampleDoctor = docListRes.body.data[0];
  const slug = sampleDoctor?.slug || sampleDoctor?._id;

  const docProfRes = await request(`/api/doctors/${slug}`);
  assert(docProfRes.status === 200, `GET /api/doctors/:slug returned HTTP ${docProfRes.status} for ${sampleDoctor?.name}`);

  const specialtiesRes = await request("/api/doctors/specialties");
  assert(specialtiesRes.status === 200, `GET /api/doctors/specialties returned HTTP ${specialtiesRes.status}`);
  assert(Array.isArray(specialtiesRes.body.data) && specialtiesRes.body.data.length > 0, "Returned specialties list");

  const branchRes = await request(`/api/doctors/${sampleDoctor._id}/branches`);
  assert(branchRes.status === 200, `GET /api/doctors/:id/branches returned HTTP ${branchRes.status}`);

  // 4. Hospitals Endpoints
  console.log("\n4. Checking Hospital Endpoints...");
  const hospListRes = await request("/api/hospitals?limit=5");
  assert(hospListRes.status === 200, `GET /api/hospitals returned HTTP ${hospListRes.status}`);
  assert(Array.isArray(hospListRes.body.data) && hospListRes.body.data.length > 0, `Returned ${hospListRes.body.data?.length} hospitals`);

  const hospDeptRes = await request("/api/hospitals/departments");
  assert(hospDeptRes.status === 200, `GET /api/hospitals/departments returned HTTP ${hospDeptRes.status}`);

  // 5. Pharmacies Endpoints
  console.log("\n5. Checking Pharmacy Endpoints...");
  const pharmListRes = await request("/api/pharmacies?limit=5");
  assert(pharmListRes.status === 200, `GET /api/pharmacies returned HTTP ${pharmListRes.status}`);
  assert(Array.isArray(pharmListRes.body.data) && pharmListRes.body.data.length > 0, `Returned ${pharmListRes.body.data?.length} pharmacies`);

  // 6. Medicines Endpoints
  console.log("\n6. Checking Medicine Endpoints...");
  const medListRes = await request("/api/medicines?limit=5");
  assert(medListRes.status === 200, `GET /api/medicines returned HTTP ${medListRes.status}`);
  assert(Array.isArray(medListRes.body.data) && medListRes.body.data.length > 0, `Returned ${medListRes.body.data?.length} medicines`);

  const medCatRes = await request("/api/medicines/categories");
  assert(medCatRes.status === 200, `GET /api/medicines/categories returned HTTP ${medCatRes.status}`);

  // 7. Authentication & OTP Flow
  console.log("\n7. Checking Auth & OTP Verification Pipeline...");
  const testPhone = "017" + Math.floor(10000000 + Math.random() * 90000000);
  const otpSendRes = await request("/api/auth/send-otp", {
    method: "POST",
    body: { phone: testPhone }
  });
  assert(otpSendRes.status === 200, `POST /api/auth/send-otp returned HTTP ${otpSendRes.status}`);
  assert(!otpSendRes.body.otp && !otpSendRes.body.code, "Zero OTP leakage in response payload");

  // 8. Protected Routes & Authorization Guards
  console.log("\n8. Checking Protected Route Guardrails (Zero-Trust Token Check)...");
  const unauthAppt = await request("/api/appointments/my");
  assert(unauthAppt.status === 401, `GET /api/appointments/my rejects unauthenticated request with HTTP 401`);

  const unauthPresc = await request("/api/prescriptions/my-prescriptions");
  assert(unauthPresc.status === 401, `GET /api/prescriptions/my-prescriptions rejects unauthenticated request with HTTP 401`);

  const unauthNotif = await request("/api/notifications");
  assert(unauthNotif.status === 401, `GET /api/notifications rejects unauthenticated request with HTTP 401`);

  // 9. AI Assistant Health Query Endpoint
  console.log("\n9. Checking AI Health Assistant Endpoint...");
  const aiChatRes = await request("/api/ai/chat", {
    method: "POST",
    body: { message: "Rajshahi best cardiology doctors" }
  });
  assert(aiChatRes.status === 200, `POST /api/ai/chat returned HTTP ${aiChatRes.status}`);
  assert(!!aiChatRes.body.reply || !!aiChatRes.body.data?.reply || !!aiChatRes.body.data?.text || !!aiChatRes.body.message, "AI generated clinical reply");

  // 10. 404 Error Isolation
  console.log("\n10. Checking Unknown API Route Handling (Must be JSON, NOT HTML)...");
  const notFoundRes = await request("/api/nonexistent-audit-test");
  assert(notFoundRes.status === 404, `GET /api/nonexistent-audit-test returned HTTP 404`);
  assert(typeof notFoundRes.body === "object" && notFoundRes.body.code === "NOT_FOUND", "Returns structured JSON error (not HTML index.html)");

  // 11. CORS Origin Headers
  console.log("\n11. Checking CORS Origin Headers...");
  const corsAllowedRes = await request("/api/health", {
    headers: { "Origin": "http://localhost:3000" }
  });
  assert(corsAllowedRes.headers["access-control-allow-origin"] === "http://localhost:3000", "Access-Control-Allow-Origin correctly mirrors authorized origin");

  const vercelCorsRes = await request("/api/health", {
    headers: { "Origin": "https://niramoy-preview-pr12.vercel.app" }
  });
  assert(vercelCorsRes.headers["access-control-allow-origin"] === "https://niramoy-preview-pr12.vercel.app", "Vercel preview deployments (*.vercel.app) authorized for CORS");

  console.log("\n====================================================================");
  console.log(`   ENDPOINT AUDIT COMPLETE: ${passed} PASSED | ${failed} FAILED`);
  console.log("====================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error("Audit Execution Error:", err);
  process.exit(1);
});
