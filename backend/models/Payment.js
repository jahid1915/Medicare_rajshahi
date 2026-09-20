const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  payment_number: { type: String, unique: true },

  order_id:    { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  patient_id:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  amount:   { type: Number, required: true },
  currency: { type: String, default: "BDT" },

  gateway: {
    type: String,
    enum: ["sslcommerz","aamarpay","shurjopay","manual","cash"],
    required: true
  },
  method: {
    type: String,
    enum: ["bkash","nagad","rocket","card","internet_banking","cash","manual"]
  },

  // Gateway transaction references
  transaction_id:         { type: String, unique: true, sparse: true },
  gateway_transaction_id: { type: String },
  idempotency_key:        { type: String, unique: true, sparse: true },

  status: {
    type: String,
    enum: ["initiated","pending","processing","successful","failed","cancelled","refunded","partially_refunded"],
    default: "initiated"
  },

  // Raw gateway response — store for audit purposes
  gateway_response: { type: mongoose.Schema.Types.Mixed },

  paid_at:     { type: Date, default: null },
  failed_at:   { type: Date, default: null },
  failure_reason: { type: String }

}, { timestamps: true });

// Auto-generate payment number
paymentSchema.pre("save", function(next) {
  if (!this.payment_number) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(Math.random() * 9000) + 1000;
    this.payment_number = `PAY-${date}-${rand}`;
  }
  next();
});

paymentSchema.index({ order_id: 1 });
paymentSchema.index({ patient_id: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transaction_id: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
