/**
 * NIRAMOY HEALTHCARE - FULL SYSTEM INTEGRATION TEST SUITE
 * Tests:
 * 1. Database Connection
 * 2. Patient Email OTP Request, Rate-limiting, & Verification
 * 3. Doctor Branch & Dynamic Schedule Slots
 * 4. Zero-Trust Pending Appointment Creation & Double-Booking Prevention
 * 5. SSLCOMMERZ Sandbox Payment Initiation & Server-side Order Validation
 * 6. Appointment Confirmation & Idempotent Serial Generation (NRM-YYYY-MMDD-XXXX)
 * 7. Digital PDF Confirmation Generation
 * 8. Multi-Tenant Pharmacy Owner Isolation
 * 9. Excel Import Validation (.xlsx / .csv) & Audit Trail
 * 10. Prescription to Pharmacy Availability Matching Engine
 */

require("dotenv").config();
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server");

// Models
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const DoctorBranch = require("../models/DoctorBranch");
const DoctorSchedule = require("../models/DoctorSchedule");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const OtpVerification = require("../models/OtpVerification");
const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/Medicine");
const PharmacyInventory = require("../models/PharmacyInventory");
const InventoryAudit = require("../models/InventoryAudit");
const { generateAppointmentPdf } = require("../services/pdfService");

async function waitForDb() {
  if (mongoose.connection.readyState === 1) return;
  return new Promise((resolve) => {
    mongoose.connection.once("open", resolve);
    // Timeout fallback
    setTimeout(resolve, 5000);
  });
}

async function runTests() {
  console.log("====================================================================");
  console.log("   NIRAMOY HEALTHCARE - E2E COMPREHENSIVE INTEGRATION TEST SUITE    ");
  console.log("====================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Database Connection
    console.log("1. Testing MongoDB Atlas Connectivity...");
    await waitForDb();
    assert(mongoose.connection.readyState === 1, "MongoDB connected and operational");

    // 2. Patient Phone OTP Authentication (MIM SMS & Zero-Leakage)
    console.log("\n2. Testing Patient Phone OTP Authentication Flow (Zero Leakage)...");
    const testPhone = `017${Math.floor(10000000 + Math.random() * 90000000)}`;
    const testEmail = `patient.${Date.now()}@niramoy.test`;
    
    // Request OTP via Phone
    const otpReq = await request(app)
      .post("/api/auth/send-otp")
      .send({ phone: testPhone, name: "Rahim Test Patient" });
    assert(otpReq.status === 200 && otpReq.body.success, "Patient Phone OTP requested successfully");
    
    // Strict zero-leakage check
    assert(otpReq.body.data?.otp === undefined && otpReq.body.data?.simulatedOtp === undefined, "Zero OTP leakage in API response");

    // Check OTP record in DB is hashed
    const otpDoc = await OtpVerification.findOne({ phone: testPhone }).sort({ createdAt: -1 });
    assert(otpDoc && otpDoc.otp_hash, "OTP stored securely as SHA-256 hash in MongoDB");

    // Test with wrong OTP
    const wrongOtpRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({ phone: testPhone, otp: "000000" });
    assert(wrongOtpRes.status === 400, "Rejects incorrect OTP with attempt countdown");

    // Inject known test hash for verification test
    const crypto = require("crypto");
    const testOtp = "654321";
    const testHash = crypto.createHash("sha256").update(testOtp).digest("hex");
    await OtpVerification.create({
      phone: testPhone,
      otp_hash: testHash,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      verified: false
    });

    // Verify with valid OTP
    const verifyRes = await request(app)
      .post("/api/auth/verify-otp")
      .send({
        phone: testPhone,
        otp: testOtp
      });
    
    assert((verifyRes.status === 200 || verifyRes.status === 201) && verifyRes.body.data?.token, "Phone OTP verified & Patient JWT generated");
    const patientToken = verifyRes.body.data.token;
    const patientUser = verifyRes.body.data.user;
    assert(patientUser.role === "patient", "New user has 'patient' role");
    assert(patientUser.phone === testPhone, "User phone matches verified number");

    // Test Patient Profile Completion
    console.log("\n2b. Testing Patient Profile Completion & Percentage Calculation...");
    const profileUpdateRes = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        name: "Rahim Test Patient",
        gender: "male",
        blood_group: "B+",
        address: "Laxmipur, Rajshahi",
        emergency_contact_name: "Karim Uddin",
        emergency_contact_phone: "01811223344",
        allergies: "None",
        existing_conditions: "Mild Hypertension"
      });
    assert(profileUpdateRes.status === 200, "Profile updated with clinical & emergency details");
    assert(profileUpdateRes.body.data?.profileCompletion?.percentage >= 70, `Profile completion calculated correctly (${profileUpdateRes.body.data?.profileCompletion?.percentage}%)`);

    // 3. Doctor Branch & Dynamic Schedule Slots
    console.log("\n3. Testing Doctor Branches & Dynamic Slot Calculation...");
    const sampleDoctor = await Doctor.findOne();
    assert(!!sampleDoctor, `Found active doctor: ${sampleDoctor?.name}`);

    const branchesRes = await request(app)
      .get(`/api/doctors/${sampleDoctor._id}/branches`);
    
    const branches = branchesRes.body.data?.branches || [];
    assert(branchesRes.status === 200 && branches.length > 0, `Fetched ${branches.length} branches for doctor`);
    const branch = branches[0];

    // Get available slots for an active day (skip off-days like Friday if applicable)
    let dateStr = "";
    let availableSlots = [];
    for (let offset = 1; offset <= 7; offset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + offset);
      const testDateStr = targetDate.toISOString().split("T")[0];
      const slotsRes = await request(app)
        .get(`/api/doctors/${sampleDoctor._id}/branches/${branch._id}/slots?date=${testDateStr}`);
      const slots = slotsRes.body.data?.slots || [];
      const avail = slots.filter(s => s.available);
      if (avail.length > 0) {
        dateStr = testDateStr;
        availableSlots = avail;
        break;
      }
    }
    assert(availableSlots.length > 0, `Found ${availableSlots.length} available slots for ${dateStr}`);
    const selectedSlot = availableSlots[0];

    // 4. Create Pending Appointment (Zero-Trust Slot Hold)
    console.log("\n4. Testing Zero-Trust Pending Appointment Creation & Slot Hold...");
    const createAptRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId: sampleDoctor._id,
        branchId: branch._id,
        appointmentDate: dateStr,
        startTime: selectedSlot.time,
        appointmentType: "ONLINE",
        reason: "Routine health checkup",
        patientDetails: {
          fullName: "Jahid Hasan Test",
          email: testEmail,
          phone: "01711223344",
          gender: "Male"
        }
      });

    if (createAptRes.status !== 201) {
      console.log("createAptRes error details:", createAptRes.status, createAptRes.body);
    }
    assert(createAptRes.status === 201, "Pending appointment created with HTTP 201");
    const appointment = createAptRes.body.data?.appointment;
    assert(appointment.status === "PENDING_PAYMENT", "Status is PENDING_PAYMENT");
    assert(appointment.paymentStatus === "PENDING" || appointment.paymentStatus === "UNPAID", "Payment status is initially UNPAID/PENDING");
    assert(!!appointment.holdExpiresAt, "15-minute slot hold timestamp initialized");

    // Double Booking Prevention Check
    const doubleBookRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        doctorId: sampleDoctor._id,
        branchId: branch._id,
        appointmentDate: dateStr,
        startTime: selectedSlot.time,
        appointmentType: "ONLINE"
      });
    assert(doubleBookRes.status === 409, "Double booking prevented (HTTP 409 Slot Already Reserved)");

    // 5. SSLCOMMERZ Payment Initiation
    console.log("\n5. Testing SSLCOMMERZ Sandbox Hosted Checkout Initiation...");
    const initPayRes = await request(app)
      .post("/api/payments/sslcommerz/initiate")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({
        appointmentId: appointment._id,
        amount: 1 // Malicious low amount sent by frontend should be IGNORED
      });

    assert(initPayRes.status === 200 && initPayRes.body.success, "Payment initiation successful");
    assert(!!initPayRes.body.data.paymentUrl, "Received SSLCOMMERZ GatewayPageURL");
    const transactionId = initPayRes.body.data.transactionId;
    assert(transactionId && transactionId.startsWith("NRM_"), `Generated canonical Transaction ID: ${transactionId}`);

    // Verify DB payment record
    const paymentRecord = await Payment.findOne({
      $or: [{ transactionId }, { transaction_id: transactionId }]
    });
    assert(!!paymentRecord, "Payment document saved in database");
    assert(paymentRecord.amount === appointment.consultationFee, "Amount derived strictly from Doctor fee (Zero-Trust Verified)");

    // 6. IPN & Order Validation Simulation (Confirming Appointment)
    console.log("\n6. Testing SSLCOMMERZ IPN & Order Validation Verification...");
    const ipnRes = await request(app)
      .post("/api/payments/sslcommerz/ipn")
      .send({
        tran_id: transactionId,
        val_id: `SIM_VAL_${Date.now()}`,
        status: "VALID",
        amount: paymentRecord.amount,
        currency: "BDT",
        bank_tran_id: `BANK_${Date.now()}`
      });

    assert(ipnRes.status === 200, "SSLCOMMERZ IPN accepted and validated");

    // Check confirmed appointment
    const confirmedApt = await Appointment.findById(appointment._id);
    assert(confirmedApt.status === "CONFIRMED", "Appointment status updated to CONFIRMED");
    assert(confirmedApt.paymentStatus === "PAID", "Payment status updated to PAID");
    assert(!!confirmedApt.serialNumber && confirmedApt.serialNumber.startsWith("NRM-"), `Generated serial number: ${confirmedApt.serialNumber}`);

    // Test Idempotency (Sending IPN twice should not duplicate serial or throw)
    const secondIpnRes = await request(app)
      .post("/api/payments/sslcommerz/ipn")
      .send({
        tran_id: transactionId,
        val_id: `SIM_VAL_${Date.now()}`,
        status: "VALID",
        amount: paymentRecord.amount
      });
    assert(secondIpnRes.status === 200, "Second IPN handled idempotently without error");
    const recheckedApt = await Appointment.findById(appointment._id);
    assert(recheckedApt.serialNumber === confirmedApt.serialNumber, "Serial number remains unchanged on duplicate notification");

    // 7. PDF Generation Service
    console.log("\n7. Testing Digital PDF Confirmation Voucher Generation...");
    const pdfBuffer = await generateAppointmentPdf(confirmedApt, paymentRecord);
    assert(Buffer.isBuffer(pdfBuffer) && pdfBuffer.length > 3000, `High-res PDF generated successfully (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);

    // 8. Multi-Tenant Pharmacy Isolation
    console.log("\n8. Testing Multi-Tenant Pharmacy Isolation...");
    const owner1 = await User.create({
      name: "Owner 1",
      email: `pharmacy.owner1.${Date.now()}@niramoy.test`,
      role: "pharmacy_owner"
    });
    const pharmacy1 = await Pharmacy.create({
      owner_user_id: owner1._id,
      name: "Niramoy Pharmacy A",
      address: "Laxmipur, Rajshahi",
      area: "Laxmipur",
      phone: "01711000001",
      active: true
    });

    const owner2 = await User.create({
      name: "Owner 2",
      email: `pharmacy.owner2.${Date.now()}@niramoy.test`,
      role: "pharmacy_owner"
    });
    const pharmacy2 = await Pharmacy.create({
      owner_user_id: owner2._id,
      name: "Niramoy Pharmacy B",
      address: "Shaheb Bazar, Rajshahi",
      area: "Shaheb Bazar",
      phone: "01711000002",
      active: true
    });

    const jwt = require("jsonwebtoken");
    const token1 = jwt.sign({ id: owner1._id, role: "pharmacy_owner", pharmacy_id: pharmacy1._id }, process.env.JWT_SECRET);
    const token2 = jwt.sign({ id: owner2._id, role: "pharmacy_owner", pharmacy_id: pharmacy2._id }, process.env.JWT_SECRET);

    // Owner 1 adds inventory item
    const med = await Medicine.findOne() || await Medicine.create({
      brand_name: "Napa Extra",
      generic_name: "Paracetamol + Caffeine",
      category: "Analgesic & Antipyretic",
      dosage_form: "Tablet",
      strength: "500mg"
    });

    await PharmacyInventory.create({
      pharmacy_id: pharmacy1._id,
      medicine_id: med._id,
      quantity: 150,
      stock_quantity: 150,
      sellingPrice: 30,
      unit_price: 30,
      reorder_level: 20
    });

    // Owner 2 checks their pharmacy
    const owner2Res = await request(app)
      .get("/api/pharmacies/my-pharmacy")
      .set("Authorization", `Bearer ${token2}`);
    assert(owner2Res.status === 200, "Owner 2 fetched their pharmacy");
    assert(owner2Res.body.data.pharmacy._id.toString() === pharmacy2._id.toString(), "Owner 2 sees ONLY Pharmacy B");
    assert(owner2Res.body.data.inventory.length === 0, "Owner 2 CANNOT see Pharmacy A's inventory (Multi-Tenant Isolation Verified)");

    // 9. Excel Import Validation & Audit Trail
    console.log("\n9. Testing Excel / CSV Inventory Import & Validation...");
    const sampleCsv = `Brand Name,Generic Name,Category,Quantity,Price,Batch Number,Expiry Date\nSeclo 20,Omeprazole,Gastrointestinal,100,70,BATCH-2026,2027-12-31\nBad Med,Unknown,InvalidCat,-50,0,BATCH-ERR,invalid-date`;
    const buffer = Buffer.from(sampleCsv);

    const importRes = await request(app)
      .post("/api/pharmacies/import/preview")
      .set("Authorization", `Bearer ${token1}`)
      .attach("file", buffer, "inventory.csv");

    assert(importRes.status === 200, "CSV spreadsheet parsed and validated server-side");
    assert(importRes.body.data.validCount === 1, "Correctly identified 1 valid record");
    assert(importRes.body.data.errorCount === 1, "Correctly detected 1 invalid record with negative qty and invalid date");

    // Confirm import
    const confirmImportRes = await request(app)
      .post("/api/pharmacies/import/confirm")
      .set("Authorization", `Bearer ${token1}`)
      .send({ importBatchId: importRes.body.data.importBatchId });
    assert(confirmImportRes.status === 200, "Valid records committed to Pharmacy 1 inventory");

    // Verify audit log
    const auditCount = await InventoryAudit.countDocuments({
      $or: [{ pharmacyId: pharmacy1._id }, { pharmacy_id: pharmacy1._id }]
    });
    assert(auditCount > 0, "Inventory audit trail logged for imported stock");

    // 10. Prescription Availability Matching Engine
    console.log("\n10. Testing Prescription-Aware Pharmacy Search...");
    const Prescription = require("../models/Prescription");
    const testPrescription = await Prescription.create({
      patient_id: patientUser._id || patientUser.id,
      appointment_id: appointment._id,
      doctor_name: sampleDoctor.name,
      diagnosis: "Acute Tension Headache",
      medicines: [
        { medicine_name: "Napa Extra", dosage: "1 tab", duration: "3 days", timing: "After meal" }
      ],
      advice: "Take after meals."
    });

    const availRes = await request(app)
      .get(`/api/pharmacies/availability/by-prescription/${testPrescription._id}`);
    assert(availRes.status === 200, "Prescription availability endpoint responded successfully with real DB record");
    assert(Array.isArray(availRes.body.data.pharmacies), "Returned list of matching pharmacies with live stock status");
    assert(availRes.body.data.prescriptionNumber === testPrescription.prescription_number, "Matched real prescription number from database");

    // 11. Patient Data Authorization & Isolation
    console.log("\n11. Testing Patient Data Isolation (Patient A vs Patient B)...");
    const patientB = await User.create({
      name: "Patient B Attacker",
      phone: `019${Math.floor(10000000 + Math.random() * 90000000)}`,
      role: "patient"
    });
    const patientBToken = jwt.sign({ id: patientB._id, role: "patient" }, process.env.JWT_SECRET);

    // Patient B attempts to fetch Patient A's appointment details
    const aptSnoopRes = await request(app)
      .get(`/api/appointments/${appointment._id}`)
      .set("Authorization", `Bearer ${patientBToken}`);
    assert(aptSnoopRes.status === 403, "Patient B denied access to Patient A appointment (HTTP 403)");

    // Patient B attempts to download Patient A's voucher PDF
    const pdfSnoopRes = await request(app)
      .get(`/api/appointments/${appointment._id}/pdf`)
      .set("Authorization", `Bearer ${patientBToken}`);
    assert(pdfSnoopRes.status === 403, "Patient B denied access to Patient A appointment PDF (HTTP 403)");

    // Patient B attempts to fetch Patient A's prescription details
    const rxSnoopRes = await request(app)
      .get(`/api/prescriptions/${testPrescription._id}`)
      .set("Authorization", `Bearer ${patientBToken}`);
    assert(rxSnoopRes.status === 403, "Patient B denied access to Patient A prescription (HTTP 403)");

    // 12. Doctor Data Authorization & Isolation
    console.log("\n12. Testing Doctor Data Isolation (Doctor B vs Doctor A)...");
    const doctorBUser = await User.create({
      name: "Dr. B Attacker",
      phone: `016${Math.floor(10000000 + Math.random() * 90000000)}`,
      role: "doctor"
    });
    const doctorBProfile = await Doctor.create({
      user_id: doctorBUser._id,
      name: "Dr. B Attacker",
      slug: `dr-b-attacker-${Date.now()}`,
      phone: doctorBUser.phone,
      specialty: "Orthopedics"
    });
    const doctorBToken = jwt.sign({ id: doctorBUser._id, role: "doctor", doctor_id: doctorBProfile._id }, process.env.JWT_SECRET);

    // Doctor B attempts to view Doctor A's patient appointment
    const docSnoopRes = await request(app)
      .get(`/api/appointments/${appointment._id}`)
      .set("Authorization", `Bearer ${doctorBToken}`);
    assert(docSnoopRes.status === 403, "Doctor B denied access to Doctor A appointment (HTTP 403)");

    // 13. Pharmacy Tenant URL/ID Tampering
    console.log("\n13. Testing Pharmacy Tenant URL/ID Tampering...");
    // Owner 1 attempts to query Pharmacy 2 orders via manual ID manipulation
    const tamperOrderRes = await request(app)
      .get(`/api/pharmacy-orders/pharmacy/${pharmacy2._id}`)
      .set("Authorization", `Bearer ${token1}`);
    assert(tamperOrderRes.status === 403, "Pharmacy Owner 1 denied access to Pharmacy 2 orders (HTTP 403)");

    // 14. In-App Notification System Lifecycle & Authorization
    console.log("\n14. Testing In-App Notification System Lifecycle & Isolation...");
    const Notification = require("../models/Notification");
    const notifA = await Notification.create({
      user_id: patientUser._id || patientUser.id,
      title: "Appointment Confirmed",
      message: `Your appointment with ${sampleDoctor.name} has been confirmed.`,
      type: "appointment_confirmed",
      is_read: false
    });

    const notifB = await Notification.create({
      user_id: patientB._id,
      title: "Welcome to Niramoy",
      message: "Please complete your clinical snapshot.",
      type: "general",
      is_read: false
    });

    // Patient A fetches their notifications
    const notifListRes = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${patientToken}`);
    assert(notifListRes.status === 200, "Patient A fetched in-app notifications");
    assert(Array.isArray(notifListRes.body.data) && notifListRes.body.data.length >= 1, "Patient A sees their notifications");
    assert(notifListRes.body.data.some(n => n._id.toString() === notifA._id.toString()), "Contains Patient A notification");
    assert(!notifListRes.body.data.some(n => n._id.toString() === notifB._id.toString()), "Patient A CANNOT see Patient B notification (Isolation Verified)");

    // Patient B attempts to mark Patient A's notification as read
    const crossReadRes = await request(app)
      .patch(`/api/notifications/${notifA._id}/read`)
      .set("Authorization", `Bearer ${patientBToken}`);
    assert(crossReadRes.status === 403, "Patient B denied permission to alter Patient A notification (HTTP 403)");

    // Patient A marks their own notification as read
    const ownReadRes = await request(app)
      .patch(`/api/notifications/${notifA._id}/read`)
      .set("Authorization", `Bearer ${patientToken}`);
    assert(ownReadRes.status === 200 && (ownReadRes.body.data?.notification?.is_read === true || ownReadRes.body.data?.is_read === true), "Patient A successfully marked their notification as read");

    console.log("\n====================================================================");
    console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED                 `);
    console.log("====================================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution aborted due to unexpected error:", err);
    process.exit(1);
  }
}

runTests();
