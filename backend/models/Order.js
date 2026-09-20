const mongoose = require("mongoose");
const { v4: uuidv4 } = require("crypto");

const orderItemSchema = new mongoose.Schema({
  service_type:  { type: String, required: true },
  reference_id:  { type: mongoose.Schema.Types.ObjectId },
  description:   { type: String, required: true },
  quantity:      { type: Number, default: 1 },
  unit_price:    { type: Number, required: true },
  total:         { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  order_number: { type: String, unique: true },

  patient_id:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  provider_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  order_type: {
    type: String,
    enum: ["doctor_appointment","hospital_booking","ambulance","diagnostic","pharmacy","teleconsultation"],
    required: true
  },

  // Reference to the service record
  service_reference_id: { type: mongoose.Schema.Types.ObjectId },

  items: [orderItemSchema],

  // Financials
  subtotal:       { type: Number, required: true },
  discount:       { type: Number, default: 0 },
  platform_fee:   { type: Number, default: 0 },
  delivery_fee:   { type: Number, default: 0 },
  tax:            { type: Number, default: 0 },
  total_amount:   { type: Number, required: true },
  currency:       { type: String, default: "BDT" },

  // Partial payment tracking
  amount_paid:      { type: Number, default: 0 },
  amount_remaining: { type: Number },

  // Status
  payment_status: {
    type: String,
    enum: ["pending","partial","paid","refunded","partially_refunded"],
    default: "pending"
  },
  order_status: {
    type: String,
    enum: ["pending","awaiting_payment","confirmed","processing","completed","cancelled","refunded"],
    default: "pending"
  },

  notes:         { type: String },
  cancelled_at:  { type: Date },
  cancel_reason: { type: String }

}, { timestamps: true });

// Auto-generate order number
orderSchema.pre("save", function(next) {
  if (!this.order_number) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(Math.random() * 9000) + 1000;
    this.order_number = `MED-${date}-${rand}`;
  }
  if (this.amount_remaining == null) {
    this.amount_remaining = this.total_amount - (this.amount_paid || 0);
  }
  next();
});

orderSchema.index({ patient_id: 1 });
orderSchema.index({ order_status: 1, payment_status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
