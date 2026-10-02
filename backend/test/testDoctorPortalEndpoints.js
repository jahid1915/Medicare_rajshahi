require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const http = require("http");

async function runDoctorPortalTest() {
  console.log("\n====================================================================");
  console.log("   NIRAMOY DOCTOR PORTAL ENDPOINT AUDIT & VERIFICATION              ");
  console.log("====================================================================\n");

  const JWT_SECRET = process.env.JWT_SECRET || "medicare_ai_super_secret_jwt_key_2026_rajshahi_healthcare_platform_secure_token";

  // Create test doctor token
  const testDoctorUser = {
    id: new mongoose.Types.ObjectId().toString(),
    role: "doctor",
    name: "Dr. Audit Specialist",
    email: "audit.doctor@niramoy.test",
    specialization: "Cardiology"
  };

  const doctorToken = jwt.sign(testDoctorUser, JWT_SECRET, { expiresIn: "1h" });

  const makeRequest = (path, method = "GET", body = null) => {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const options = {
        hostname: "localhost",
        port: 5000,
        path: `/api${path}`,
        method,
        headers: {
          "Authorization": `Bearer ${doctorToken}`,
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {})
        }
      };

      const req = http.request(options, (res) => {
        let rawData = "";
        res.on("data", chunk => rawData += chunk);
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(rawData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      });

      req.on("error", reject);
      if (payload) req.write(payload);
      req.end();
    });
  };

  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`  ✓ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
      failed++;
    }
  };

  try {
    // 1. GET /doctors/me
    console.log("1. Testing GET /api/doctors/me...");
    const meRes = await makeRequest("/doctors/me");
    assert(meRes.status === 200, "GET /api/doctors/me returned HTTP 200");
    assert(meRes.data?.data?.name === "Dr. Audit Specialist", `Doctor name resolved correctly (${meRes.data?.data?.name})`);

    // 2. PUT /doctors/me
    console.log("\n2. Testing PUT /api/doctors/me (Profile update & Supabase sync)...");
    const updateRes = await makeRequest("/doctors/me", "PUT", {
      designation: "Associate Professor of Cardiology",
      consultation_fee: 1000,
      workplace: "Rajshahi Medical College Hospital"
    });
    assert(updateRes.status === 200, "PUT /api/doctors/me returned HTTP 200");
    assert(updateRes.data?.data?.consultation_fee === 1000, "Consultation fee updated to 1000 BDT");
    assert(updateRes.data?.data?.designation === "Associate Professor of Cardiology", "Designation updated successfully");

    // 3. GET /doctors/me/stats
    console.log("\n3. Testing GET /api/doctors/me/stats...");
    const statsRes = await makeRequest("/doctors/me/stats");
    assert(statsRes.status === 200, "GET /api/doctors/me/stats returned HTTP 200");
    assert(typeof statsRes.data?.data?.todayAppointments === "number", "Returned numeric todayAppointments metric");
    assert(typeof statsRes.data?.data?.estimatedRevenue === "number", "Returned numeric estimatedRevenue metric");

    // 4. GET /doctors/me/patients
    console.log("\n4. Testing GET /api/doctors/me/patients...");
    const patientsRes = await makeRequest("/doctors/me/patients");
    assert(patientsRes.status === 200, "GET /api/doctors/me/patients returned HTTP 200");
    assert(Array.isArray(patientsRes.data?.data?.patients), "Returned patients array");

    // 5. GET /doctors/me/schedule
    console.log("\n5. Testing GET /api/doctors/me/schedule...");
    const schedRes = await makeRequest("/doctors/me/schedule");
    assert(schedRes.status === 200, "GET /api/doctors/me/schedule returned HTTP 200");
    assert(Array.isArray(schedRes.data?.data?.chambers), "Returned chambers array");

    // 6. POST /doctors/me/schedule/slot-toggle
    console.log("\n6. Testing POST /api/doctors/me/schedule/slot-toggle...");
    const toggleRes = await makeRequest("/doctors/me/schedule/slot-toggle", "POST", {
      dayOfWeek: 1,
      isAvailable: true
    });
    assert(toggleRes.status === 200, "POST /api/doctors/me/schedule/slot-toggle returned HTTP 200");
    assert(toggleRes.data?.data?.active === true, "Slot availability toggled to active: true");

    console.log("\n====================================================================");
    console.log(`   DOCTOR PORTAL AUDIT: ${passed} PASSED | ${failed} FAILED`);
    console.log("====================================================================\n");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  }
}

runDoctorPortalTest();
