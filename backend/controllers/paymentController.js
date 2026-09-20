const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Invoice = require("../models/Invoice");
const Notification = require("../models/Notification");
const { successResponse, errorResponse } = require("../utils/responseHelper");

/**
 * POST /api/payments/create
 * Creates a payment intent. Idempotency check prevents duplicate payments.
 * IMPORTANT: Frontend must send idempotency_key = order_id + attempt number
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { order_id, gateway, method, idempotency_key } = req.body;
    if (!order_id || !gateway) return errorResponse(res, "order_id and gateway are required", 422);

    const order = await Order.findById(order_id);
    if (!order) return errorResponse(res, "Order not found", 404);
    if (order.patient_id.toString() !== req.user.id)
      return errorResponse(res, "Access denied", 403, "FORBIDDEN");
    if (order.payment_status === "paid")
      return errorResponse(res, "Order is already paid", 400, "ALREADY_PAID");

    // Idempotency check — prevent duplicate payment creation
    if (idempotency_key) {
      const existingPayment = await Payment.findOne({ idempotency_key });
      if (existingPayment) {
        return successResponse(res, existingPayment, "Existing payment intent returned (idempotent)");
      }
    }

    // Check for already pending payment for this order
    const pendingPayment = await Payment.findOne({
      order_id,
      status: { $in: ["initiated","pending","processing"] }
    });
    if (pendingPayment) {
      return successResponse(res, pendingPayment, "Active payment already in progress. Please complete or wait.");
    }

    const payment = await Payment.create({
      order_id,
      patient_id: req.user.id,
      amount:    order.amount_remaining || order.total_amount,
      currency:  "BDT",
      gateway:   gateway || process.env.PAYMENT_GATEWAY || "sslcommerz",
      method:    method || null,
      idempotency_key,
      status: "initiated"
    });

    // TODO: Initialize with actual payment gateway when credentials are ready
    // const gatewayResponse = await paymentGatewayService.createPayment(payment, order);

    return successResponse(res, {
      payment_id: payment._id,
      payment_number: payment.payment_number,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      // gateway_url: gatewayResponse.GatewayPageURL  // Uncomment when gateway is integrated
      message: "Payment gateway integration pending. Architecture ready for SSLCommerz/aamarPay."
    }, "Payment initiated", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/payments/webhook
 * Gateway callback — NEVER trust frontend success claims.
 * This MUST verify with gateway before marking payment successful.
 */
exports.handleWebhook = async (req, res, next) => {
  try {
    const { transaction_id, status, val_id, amount, store_id } = req.body;

    // TODO: Verify webhook signature/hash from gateway before processing
    // const isValid = paymentGatewayService.verifyWebhook(req.body, process.env.PAYMENT_STORE_PASSWORD);
    // if (!isValid) return errorResponse(res, "Invalid webhook signature", 400);

    // TODO: Re-verify transaction with gateway API
    // const gatewayVerification = await paymentGatewayService.verifyPayment(val_id);

    // Placeholder until gateway is integrated
    console.log("[Webhook] Received payment callback:", { transaction_id, status });

    return res.status(200).json({ success: true, message: "Webhook received" });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/payments/:id
 */
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("order_id");
    if (!payment) return errorResponse(res, "Payment not found", 404);
    if (payment.patient_id.toString() !== req.user.id && req.user.role !== "platform_admin")
      return errorResponse(res, "Access denied", 403);
    return successResponse(res, payment);
  } catch (err) {
    next(err);
  }
};
