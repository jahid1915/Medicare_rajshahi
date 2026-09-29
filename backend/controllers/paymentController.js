const crypto = require("crypto");
const Payment = require("../models/Payment");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const DoctorBranch = require("../models/DoctorBranch");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const AuditLog = require("../models/AuditLog");
const User = require("../models/User");
const sslcommerzService = require("../services/sslcommerzService");
const { generateAppointmentPdf } = require("../services/pdfService");
const { sendAppointmentConfirmationEmail } = require("../services/emailService");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

/**
 * Helper: Validates and confirms transaction with SSLCOMMERZ Order Validation API
 * Idempotent: safe to run multiple times for IPN and Return callbacks
 */
async function validateAndConfirmTransaction(payload) {
  const { tran_id, val_id, status, amount, bank_tran_id, risk_level } = payload;
  console.log(`[Payment Engine] Validating TranID: ${tran_id}, ValID: ${val_id}, Status: ${status}`);

  if (!tran_id) return { success: false, reason: "Missing transaction ID" };

  const payment = await Payment.findOne({ transaction_id: tran_id });
  if (!payment) {
    console.warn(`[Payment Warning] Record not found for TranID: ${tran_id}`);
    return { success: false, reason: "Payment record not found" };
  }

  const apptId = payment.appointment_id || payment.appointmentId;
  const appointment = apptId ? await Appointment.findById(apptId) : null;

  // Idempotency: If already confirmed, avoid duplicate operations
  if (payment.status === "successful" || payment.status === "PAID") {
    console.log(`[Payment Idempotency] TranID ${tran_id} already validated & paid.`);
    return { success: true, payment, appointment, alreadyProcessed: true };
  }

  // Server-Side Order Validation API Call
  const validationResult = await sslcommerzService.validateOrder({
    val_id,
    transactionId: tran_id,
    expectedAmount: payment.amount,
    expectedCurrency: payment.currency || "BDT"
  });

  if (!validationResult.success || validationResult.status !== "VALID") {
    console.warn(`[Payment Failure] Validation failed for TranID ${tran_id}: ${validationResult.reason}`);
    payment.status = "failed";
    payment.failed_at = new Date();
    payment.failure_reason = validationResult.reason || "Validation API returned non-valid status";
    payment.status_history.push({
      from_status: payment.status,
      to_status: "failed",
      changed_at: new Date(),
      actor_role: "gateway_validation",
      actor_name: "SSLCOMMERZ Validation API",
      note: `Validation failed: ${validationResult.reason}`
    });
    await payment.save();

    if (appointment) {
      appointment.paymentStatus = "FAILED";
      appointment.status = "CANCELLED";
      await appointment.save();
    }

    return { success: false, reason: validationResult.reason, payment, appointment };
  }

  // Validation succeeded: Mark payment as PAID
  payment.status = "successful";
  payment.paid_at = new Date();
  payment.validation_id = val_id;
  payment.bank_transaction_id = bank_tran_id || validationResult.bankTranId || `BANK-${Date.now()}`;
  payment.risk_level = risk_level || validationResult.riskLevel || "0";
  payment.raw_gateway_reference = validationResult.raw;
  payment.status_history.push({
    from_status: "pending",
    to_status: "successful",
    changed_at: new Date(),
    actor_role: "gateway_validation",
    actor_name: "SSLCOMMERZ Validation API",
    note: `Transaction validated successfully via Order Validation API (ValID: ${val_id})`,
    gateway_ref: val_id
  });
  await payment.save();

  if (appointment) {
    appointment.paymentStatus = "PAID";
    appointment.status = "CONFIRMED";
    appointment.paymentId = payment._id;

    // Generate Unique Serial ID (Format: NRM-YYYY-MMDD-XXXX)
    if (!appointment.serialNumber) {
      const d = new Date();
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, "0");
      const da = String(d.getDate()).padStart(2, "0");
      const totalConfirmed = await Appointment.countDocuments({ status: "CONFIRMED" });
      const seq = String(totalConfirmed + 1).padStart(4, "0");
      appointment.serialNumber = `NRM-${yr}-${mo}${da}-${seq}`;
    }

    await appointment.save();

    // Populate references for PDF Voucher & Confirmation Email
    const populatedAppt = await Appointment.findById(appointment._id)
      .populate("doctorId")
      .populate("doctor_id")
      .populate("branchId")
      .populate("branch_id")
      .populate("patientId");

    const doctor = populatedAppt.doctorId || populatedAppt.doctor_id;
    const branch = populatedAppt.branchId || populatedAppt.branch_id;
    const patient = populatedAppt.patientId || { name: populatedAppt.patientName, email: populatedAppt.patientEmail, phone: populatedAppt.patientPhone };

    try {
      const pdfBuffer = await generateAppointmentPdf({
        appointment: populatedAppt,
        doctor,
        branch,
        patient,
        payment
      });

      const emailRes = await sendAppointmentConfirmationEmail({
        appointment: populatedAppt,
        payment,
        pdfBuffer
      });

      appointment.emailDeliveryStatus = emailRes.success ? "SENT" : "FAILED";
      await appointment.save();
    } catch (docErr) {
      console.error("[Post-Payment PDF/Email Error]:", docErr.message);
      appointment.emailDeliveryStatus = "FAILED";
      await appointment.save();
    }

    await AuditLog.create({
      actor_id: payment.patient_id,
      actor_name: payment.customer_name || "Patient",
      actor_role: "patient",
      action: "APPOINTMENT_PAYMENT_CONFIRMED",
      detail: `Appointment ${appointment.appointmentId} confirmed with Serial ${appointment.serialNumber}. TranID: ${tran_id}`
    });
  }

  return { success: true, payment, appointment };
}

/**
 * POST /api/payments/sslcommerz/initiate
 * Secure payment session initiation: verifies appointment, slot hold, computes fee from DB, returns GatewayPageURL
 */
exports.initiateSslCommerzPayment = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return errorResponse(res, "Appointment ID is required", 422);

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId")
      .populate("doctor_id")
      .populate("branchId")
      .populate("branch_id");

    if (!appointment) return errorResponse(res, "Appointment not found", 404);

    // Verify appointment ownership
    const apptPatientId = appointment.patientId || appointment.patient_id;
    if (apptPatientId && apptPatientId.toString() !== req.user.id && req.user.role !== "super_admin") {
      return errorResponse(res, "Access denied. This appointment does not belong to your account.", 403);
    }

    // Verify appointment state
    if (appointment.status === "CONFIRMED" || appointment.paymentStatus === "PAID") {
      return errorResponse(res, "This appointment has already been paid and confirmed.", 400, "ALREADY_PAID");
    }

    // Verify slot hold
    if (appointment.holdExpiresAt && new Date() > new Date(appointment.holdExpiresAt)) {
      appointment.status = "EXPIRED";
      appointment.paymentStatus = "FAILED";
      await appointment.save();
      return errorResponse(res, "Your temporary slot hold has expired. Please choose a slot again.", 410, "HOLD_EXPIRED");
    }

    // Determine amount from DB (Never trust frontend amount)
    const doctor = appointment.doctorId || appointment.doctor_id;
    const branch = appointment.branchId || appointment.branch_id;
    const fee = (branch && branch.consultationFee) || (doctor && doctor.consultation_fee) || appointment.consultationFee || 800;

    // Generate unique SSLCOMMERZ Transaction ID
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randPart = crypto.randomBytes(4).toString("hex").toUpperCase();
    const transactionId = `NRM_APPT_${datePrefix}_${randPart}`;

    const payment = await Payment.create({
      appointment_id: appointment._id,
      appointmentId: appointment._id,
      patient_id: req.user.id,
      patientId: req.user.id,
      amount: fee,
      currency: "BDT",
      gateway: "sslcommerz",
      transaction_id: transactionId,
      customer_name: req.user.name || appointment.patientName,
      customer_phone: req.user.phone || appointment.patientPhone,
      customer_email: req.user.email || appointment.patientEmail,
      service_type: "doctor_appointment",
      status: "pending",
      status_history: [{
        from_status: null,
        to_status: "pending",
        changed_at: new Date(),
        changed_by: req.user.id,
        actor_role: "patient",
        actor_name: req.user.name || "Patient",
        note: `SSLCOMMERZ checkout initiated for appointment ${appointment.appointmentId || appointment._id}`,
        gateway_ref: transactionId
      }]
    });

    // Request session from SSLCOMMERZ
    const sessionResult = await sslcommerzService.initSession({
      transactionId,
      amount: fee,
      currency: "BDT",
      customer: {
        id: req.user.id,
        name: req.user.name || appointment.patientName,
        email: req.user.email || appointment.patientEmail,
        phone: req.user.phone || appointment.patientPhone,
        address: req.user.address || appointment.address || "Rajshahi, Bangladesh"
      },
      appointment,
      doctor,
      branch
    });

    if (!sessionResult.success || !sessionResult.gatewayPageUrl) {
      return errorResponse(res, "Failed to connect to SSLCOMMERZ gateway. Please try again.", 502);
    }

    payment.session_key = sessionResult.sessionKey;
    await payment.save();

    appointment.paymentId = payment._id;
    appointment.sslTransactionId = transactionId;
    await appointment.save();

    return successResponse(res, {
      gatewayPageUrl: sessionResult.gatewayPageUrl,
      paymentUrl: sessionResult.gatewayPageUrl,
      transactionId,
      appointmentId: appointment._id,
      amount: fee,
      currency: "BDT",
      isSandbox: sessionResult.isSandboxSimulated || false
    }, "Payment session initiated successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payments/sslcommerz/ipn
 * Instant Payment Notification from SSLCOMMERZ
 */
exports.handleSslCommerzIpn = async (req, res, next) => {
  try {
    const payload = req.body;
    console.log("[SSLCOMMERZ IPN Received]:", payload);

    const result = await validateAndConfirmTransaction(payload);
    return res.status(200).json({
      success: result.success,
      message: result.alreadyProcessed ? "Already processed" : (result.success ? "IPN verified successfully" : "Validation failed"),
      reason: result.reason
    });
  } catch (err) {
    console.error("[SSLCOMMERZ IPN Error]:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * POST /api/payments/sslcommerz/success
 * Browser return callback from SSLCOMMERZ Hosted Checkout page
 */
exports.handleSslCommerzSuccess = async (req, res, next) => {
  try {
    const payload = req.body;
    console.log("[SSLCOMMERZ Success Return]:", payload);

    const result = await validateAndConfirmTransaction(payload);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    if (result.success && result.appointment) {
      const serial = result.appointment.serialNumber || "CONFIRMED";
      const tranId = payload.tran_id || "";
      const apptId = result.appointment._id.toString();
      return res.redirect(`${frontendUrl}/dashboard?tab=appointments&payment=success&tran_id=${tranId}&serial=${serial}&appointmentId=${apptId}`);
    } else {
      return res.redirect(`${frontendUrl}/dashboard?tab=appointments&payment=failed&tran_id=${payload.tran_id || ""}&reason=${encodeURIComponent(result.reason || "Validation failed")}`);
    }
  } catch (err) {
    console.error("[SSLCOMMERZ Return Error]:", err.message);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/dashboard?tab=appointments&payment=failed&reason=InternalServerError`);
  }
};

/**
 * POST /api/payments/sslcommerz/fail
 */
exports.handleSslCommerzFail = async (req, res, next) => {
  try {
    const { tran_id, error } = req.body;
    console.log("[SSLCOMMERZ Payment Failed Callback]:", req.body);

    if (tran_id) {
      const payment = await Payment.findOne({ transaction_id: tran_id });
      if (payment) {
        payment.status = "failed";
        payment.failed_at = new Date();
        payment.failure_reason = error || "Payment failed at SSLCOMMERZ Gateway";
        await payment.save();

        if (payment.appointment_id) {
          await Appointment.findByIdAndUpdate(payment.appointment_id, {
            status: "CANCELLED",
            paymentStatus: "FAILED"
          });
        }
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/dashboard?tab=appointments&payment=failed&tran_id=${tran_id || ""}`);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payments/sslcommerz/cancel
 */
exports.handleSslCommerzCancel = async (req, res, next) => {
  try {
    const { tran_id } = req.body;
    console.log("[SSLCOMMERZ Payment Cancelled Callback]:", req.body);

    if (tran_id) {
      const payment = await Payment.findOne({ transaction_id: tran_id });
      if (payment) {
        payment.status = "cancelled";
        await payment.save();

        if (payment.appointment_id) {
          await Appointment.findByIdAndUpdate(payment.appointment_id, {
            status: "CANCELLED",
            paymentStatus: "CANCELLED"
          });
        }
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/dashboard?tab=appointments&payment=cancelled&tran_id=${tran_id || ""}`);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments/sslcommerz/sandbox-checkout
 * Realistic Sandbox Gateway Testing UI (renders for sandbox checkouts)
 */
exports.renderSandboxCheckout = (req, res) => {
  const { tran_id, amount, appt_id } = req.query;
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SSLCOMMERZ Sandbox Gateway Simulator</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .card { background: #1e293b; border: 1px solid #334155; border-radius: 18px; max-width: 480px; width: 100%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .badge { display: inline-block; background: #0d7c6e; color: #fff; padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .title { font-size: 22px; font-weight: 900; margin: 12px 0 4px; color: #fff; }
        .desc { font-size: 13px; color: #94a3b8; margin-bottom: 24px; line-height: 1.5; }
        .summary-box { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
        .row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #1e293b; }
        .row:last-child { border-bottom: none; }
        .row .label { color: #64748b; }
        .row .val { font-weight: 700; color: #f8fafc; }
        .btn { width: 100%; padding: 14px; border: none; border-radius: 10px; font-weight: 800; font-size: 14px; cursor: pointer; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s ease; }
        .btn-success { background: #10b981; color: #042f2e; }
        .btn-success:hover { background: #34d399; }
        .btn-fail { background: #ef4444; color: #450a0a; }
        .btn-fail:hover { background: #f87171; }
        .btn-cancel { background: #334155; color: #cbd5e1; }
        .btn-cancel:hover { background: #475569; }
        .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">SSLCOMMERZ SANDBOX HOSTED CHECKOUT</div>
        <h1 class="title">Secure Payment Gateway</h1>
        <p class="desc">You are in the official SSLCOMMERZ Sandbox environment. Test payment completion below to trigger real server-side validation.</p>

        <div class="summary-box">
          <div class="row">
            <span class="label">Merchant</span>
            <span class="val">Niramoy Healthcare (Rajshahi)</span>
          </div>
          <div class="row">
            <span class="label">Transaction ID</span>
            <span class="val" style="font-family:monospace; color:#38bdf8;">${tran_id}</span>
          </div>
          <div class="row">
            <span class="label">Amount Payable</span>
            <span class="val" style="color:#34d399; font-size:16px;">৳${amount} BDT</span>
          </div>
        </div>

        <!-- Form 1: Simulate Payment Success -->
        <form method="POST" action="${backendUrl}/api/payments/sslcommerz/success">
          <input type="hidden" name="tran_id" value="${tran_id}" />
          <input type="hidden" name="val_id" value="SIM_VAL_${tran_id}" />
          <input type="hidden" name="status" value="VALID" />
          <input type="hidden" name="amount" value="${amount}" />
          <input type="hidden" name="currency" value="BDT" />
          <input type="hidden" name="bank_tran_id" value="SANDBOX-BANK-${Date.now()}" />
          <button type="submit" class="btn btn-success">
            💳 Complete Payment (৳${amount} BDT - Success)
          </button>
        </form>

        <!-- Form 2: Simulate Payment Failure -->
        <form method="POST" action="${backendUrl}/api/payments/sslcommerz/fail">
          <input type="hidden" name="tran_id" value="${tran_id}" />
          <input type="hidden" name="status" value="FAILED" />
          <button type="submit" class="btn btn-fail">
            ❌ Simulate Payment Failure
          </button>
        </form>

        <!-- Form 3: Simulate Payment Cancellation -->
        <form method="POST" action="${backendUrl}/api/payments/sslcommerz/cancel">
          <input type="hidden" name="tran_id" value="${tran_id}" />
          <input type="hidden" name="status" value="CANCELLED" />
          <button type="submit" class="btn btn-cancel">
            ↩ Cancel & Return to Niramoy
          </button>
        </form>

        <div class="footer">
          🔒 SSL 256-bit Encrypted Sandbox Gateway • Niramoy Healthcare Platform
        </div>
      </div>
    </body>
    </html>
  `;

  res.setHeader("Content-Type", "text/html");
  return res.send(html);
};

/**
 * Legacy Admin & Shared Payment Endpoints
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { order_id, gateway, method, idempotency_key, service_type, amount, hospital_id, pharmacy_id } = req.body;
    let payAmount = amount;
    let targetOrder = null;

    if (order_id) {
      targetOrder = await Order.findById(order_id);
      if (!targetOrder) return errorResponse(res, "Order not found", 404);
      payAmount = targetOrder.amount_remaining || targetOrder.total_amount;
    }

    const payment = await Payment.create({
      order_id: targetOrder ? targetOrder._id : null,
      patient_id: req.user.id,
      amount: payAmount,
      currency: "BDT",
      gateway: gateway || "sslcommerz",
      method: method || null,
      service_type: service_type || "doctor_appointment",
      customer_name: req.user.name,
      customer_phone: req.user.phone,
      customer_email: req.user.email,
      idempotency_key,
      status: "initiated"
    });

    return successResponse(res, payment, "Payment initiated", 201);
  } catch (err) {
    next(err);
  }
};

exports.getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { transaction_id: new RegExp(search, "i") },
        { customer_name: new RegExp(search, "i") },
        { customer_phone: new RegExp(search, "i") }
      ];
    }
    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate("patient_id", "name email phone")
      .populate("appointment_id", "serialNumber appointmentDate")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    return paginatedResponse(res, payments, total, parseInt(page), parseInt(limit), "Transactions retrieved");
  } catch (err) {
    next(err);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("patient_id", "name email phone")
      .populate("appointment_id");
    if (!payment) return errorResponse(res, "Payment not found", 404);
    return successResponse(res, payment, "Payment details fetched");
  } catch (err) {
    next(err);
  }
};

exports.transitionPaymentStatus = async (req, res, next) => {
  try {
    const { to_status, note } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return errorResponse(res, "Payment not found", 404);
    payment.status = to_status;
    await payment.save();
    return successResponse(res, payment, `Status transitioned to ${to_status}`);
  } catch (err) {
    next(err);
  }
};

exports.handleWebhook = exports.handleSslCommerzIpn;
