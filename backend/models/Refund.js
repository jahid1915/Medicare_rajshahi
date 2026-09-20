const mongoose = require("mongoose");

const refundSchema = new mongoose.Schema({
  payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
  order_id:   { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  requested_amount: { type: Number, required: true },
  approved_amount:  { type: Number },
  currency:         { type: String, default: "BDT" },

  reason: {
    type: String,
    enum: ["appointment_cancelled","service_not_provided","duplicate_payment","patient_request","other"],
    required: true
  },
  reason_detail: { type: String },

  status: {
    type: String,
    enum: ["requested","approved","processing","completed","failed","rejected"],
    default: "requested"
  },

  refund_transaction_id: { type: String },
  gateway_refund_id:     { type: String },

  processed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  processed_at: { type: Date },
  rejection_reason: { type: String }

}, { timestamps: true });

refundSchema.index({ order_id: 1 });
refundSchema.index({ patient_id: 1 });
refundSchema.index({ status: 1 });

module.exports = mongoose.model("Refund", refundSchema);
