const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/responseHelper");

/**
 * POST /api/payments/create
 * Creates a payment intent. Idempotency check prevents duplicate payments.
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { order_id, gateway, method, idempotency_key, service_type, amount, hospital_id, pharmacy_id } = req.body;

    let payAmount = amount;
    let targetOrder = null;

    if (order_id) {
      targetOrder = await Order.findById(order_id);
      if (!targetOrder) return errorResponse(res, "Order not found", 404);
      if (targetOrder.patient_id.toString() !== req.user.id && req.user.role !== "super_admin")
        return errorResponse(res, "Access denied", 403, "FORBIDDEN");
      if (targetOrder.payment_status === "paid")
        return errorResponse(res, "Order is already paid", 400, "ALREADY_PAID");
      payAmount = targetOrder.amount_remaining || targetOrder.total_amount;
    }

    if (!payAmount || payAmount <= 0) {
      return errorResponse(res, "Valid payment amount is required", 422);
    }

    // Idempotency check — prevent duplicate payment creation
    if (idempotency_key) {
      const existingPayment = await Payment.findOne({ idempotency_key });
      if (existingPayment) {
        return successResponse(res, existingPayment, "Existing payment intent returned (idempotent)");
      }
    }

    const initialTransition = {
      from_status: null,
      to_status: "initiated",
      changed_at: new Date(),
      changed_by: req.user.id,
      actor_role: req.user.role || "patient",
      actor_name: req.user.name || "Customer",
      note: "Payment checkout intent created"
    };

    const payment = await Payment.create({
      order_id: targetOrder ? targetOrder._id : null,
      patient_id: req.user.id,
      amount: payAmount,
      currency: "BDT",
      gateway: gateway || process.env.PAYMENT_GATEWAY || "sslcommerz",
      method: method || null,
      service_type: service_type || (order_id ? "pharmacy_order" : "doctor_appointment"),
      hospital_id: hospital_id || null,
      pharmacy_id: pharmacy_id || null,
      customer_name: req.user.name,
      customer_phone: req.user.phone,
      customer_email: req.user.email,
      idempotency_key,
      status: "initiated",
      status_history: [initialTransition]
    });

    return successResponse(res, {
      payment_id: payment._id,
      payment_number: payment.payment_number,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      message: "Payment initiated successfully"
    }, "Payment initiated", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments
 * Admin endpoint — List all transactions, filter by status/gateway, and calculate financial overview.
 */
exports.getAllTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      gateway,
      service_type,
      search,
      date_from,
      date_to
    } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }
    if (gateway && gateway !== "all") {
      filter.gateway = gateway;
    }
    if (service_type && service_type !== "all") {
      filter.service_type = service_type;
    }

    if (date_from || date_to) {
      filter.createdAt = {};
      if (date_from) filter.createdAt.$gte = new Date(date_from);
      if (date_to) {
        const endOfDay = new Date(date_to);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { payment_number: searchRegex },
        { transaction_id: searchRegex },
        { gateway_transaction_id: searchRegex },
        { customer_name: searchRegex },
        { customer_phone: searchRegex },
        { customer_email: searchRegex }
      ];
    }

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate("patient_id", "name email phone")
      .populate("hospital_id", "name short_name area")
      .populate("pharmacy_id", "name area")
      .populate("order_id", "order_number total_amount payment_status")
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Summary Analytics Aggregation
    const statsAgg = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "successful"] }, "$amount", 0]
            }
          },
          totalCount: { $sum: 1 },
          successfulCount: {
            $sum: { $cond: [{ $eq: ["$status", "successful"] }, 1, 0] }
          },
          pendingCount: {
            $sum: {
              $cond: [{ $in: ["$status", ["initiated", "pending", "processing"]] }, 1, 0]
            }
          },
          failedCount: {
            $sum: { $cond: [{ $in: ["$status", ["failed", "cancelled"]] }, 1, 0] }
          },
          refundedCount: {
            $sum: { $cond: [{ $in: ["$status", ["refunded", "partially_refunded"]] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = statsAgg[0] || {
      totalRevenue: 0,
      totalCount: 0,
      successfulCount: 0,
      pendingCount: 0,
      failedCount: 0,
      refundedCount: 0
    };

    return successResponse(res, {
      transactions: payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      stats
    }, "Transactions retrieved successfully");
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments/:id
 */
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("patient_id", "name email phone")
      .populate("hospital_id", "name short_name address area phone")
      .populate("pharmacy_id", "name address area phone")
      .populate("order_id");

    if (!payment) return errorResponse(res, "Payment not found", 404);

    const isOwner = payment.patient_id && payment.patient_id._id.toString() === req.user.id;
    const isStaff = ["super_admin", "compliance_auditor", "hospital_admin", "pharmacy_owner"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return errorResponse(res, "Access denied", 403);
    }

    return successResponse(res, payment, "Payment details fetched");
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/payments/:id/transition
 * Transition payment status with comprehensive audit trail
 */
exports.transitionPaymentStatus = async (req, res, next) => {
  try {
    const { to_status, note, gateway_ref } = req.body;
    if (!to_status) {
      return errorResponse(res, "New status (to_status) is required", 422);
    }

    const validStatuses = ["initiated", "pending", "processing", "successful", "failed", "cancelled", "refunded", "partially_refunded"];
    if (!validStatuses.includes(to_status)) {
      return errorResponse(res, `Invalid status. Must be one of: ${validStatuses.join(", ")}`, 422);
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) return errorResponse(res, "Payment record not found", 404);

    const prevStatus = payment.status;

    // Record transition entry
    const transitionEntry = {
      from_status: prevStatus,
      to_status,
      changed_at: new Date(),
      changed_by: req.user.id,
      actor_role: req.user.role,
      actor_name: req.user.name || "Administrator",
      note: note || `Status transitioned from ${prevStatus} to ${to_status}`,
      gateway_ref: gateway_ref || payment.transaction_id || null
    };

    payment.status = to_status;
    if (!payment.status_history) payment.status_history = [];
    payment.status_history.push(transitionEntry);

    if (to_status === "successful") {
      payment.paid_at = new Date();
      if (payment.order_id) {
        await Order.findByIdAndUpdate(payment.order_id, { payment_status: "paid" });
      }
    } else if (to_status === "failed") {
      payment.failed_at = new Date();
      payment.failure_reason = note || "Payment marked as failed";
    }

    await payment.save();

    await AuditLog.create({
      actor_id: req.user.id,
      actor_name: req.user.name,
      actor_role: req.user.role,
      action: "PAYMENT_STATUS_TRANSITIONED",
      detail: `Payment ${payment.payment_number} transitioned: ${prevStatus} -> ${to_status}. Note: ${note || "None"}`
    });

    return successResponse(res, payment, `Transaction status updated to ${to_status}`);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res, next) => {
  try {
    const { transaction_id, status, val_id } = req.body;
    console.log("[Webhook] Received payment callback:", { transaction_id, status, val_id });

    if (transaction_id) {
      const payment = await Payment.findOne({ transaction_id });
      if (payment) {
        const to_status = (status === "VALID" || status === "SUCCESS") ? "successful" : "failed";
        payment.status_history.push({
          from_status: payment.status,
          to_status,
          changed_at: new Date(),
          actor_role: "gateway_webhook",
          actor_name: "SSLCommerz Webhook IPN",
          note: `Gateway callback received with status: ${status}`,
          gateway_ref: val_id || transaction_id
        });
        payment.status = to_status;
        if (to_status === "successful") payment.paid_at = new Date();
        await payment.save();
      }
    }

    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err) {
    next(err);
  }
};
