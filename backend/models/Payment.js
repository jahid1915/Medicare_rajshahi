const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  payment_number: { type: String, unique: true },

  // Associated entities
  order_id:       { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null, index: true },
  appointmentId:  { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", default: null },
  patient_id:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  patientId:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  amount:   { type: Number, required: true },
  currency: { type: String, default: "BDT" },

  gateway: {
    type: String,
    enum: ["sslcommerz", "aamarpay", "shurjopay", "manual", "cash"],
    default: "sslcommerz"
  },
  method: {
    type: String
  },

  // Gateway transaction references
  transaction_id:         { type: String, unique: true, sparse: true, index: true },
  gateway_transaction_id: { type: String },
  session_key:            { type: String },
  validation_id:          { type: String },
  bank_transaction_id:    { type: String },
  risk_level:             { type: String, default: "0" },
  idempotency_key:        { type: String, unique: true, sparse: true },

  status: {
    type: String,
    enum: [
      "initiated",
      "pending",
      "processing",
      "successful",
      "failed",
      "cancelled",
      "refunded",
      "partially_refunded",
      "PENDING",
      "PAID",
      "FAILED",
      "CANCELLED"
    ],
    default: "initiated",
    index: true
  },

  // Raw gateway response — stored for audit & reconciliation
  gateway_response:       { type: mongoose.Schema.Types.Mixed },
  raw_gateway_reference:  { type: mongoose.Schema.Types.Mixed },

  // Associated Service / Organization
  service_type: {
    type: String,
    enum: ["doctor_appointment", "pharmacy_order", "hospital_admission", "diagnostic_test", "general"],
    default: "doctor_appointment"
  },
  hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },
  pharmacy_id: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", default: null },

  // Customer snapshot
  customer_name:  { type: String, trim: true },
  customer_phone: { type: String, trim: true },
  customer_email: { type: String, trim: true },

  paid_at:        { type: Date, default: null },
  failed_at:      { type: Date, default: null },
  failure_reason: { type: String },

  // Status transition audit history
  status_history: [
    {
      from_status: { type: String, default: null },
      to_status:   { type: String, required: true },
      changed_at:  { type: Date, default: Date.now },
      changed_by:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      actor_role:  { type: String, default: "system" },
      actor_name:  { type: String, default: "System Gateway" },
      note:        { type: String, default: "" },
      gateway_ref: { type: String, default: null }
    }
  ]

}, { timestamps: true });

// Auto-generate payment number and sync camelCase / snake_case references
paymentSchema.pre("save", function(next) {
  if (!this.payment_number) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(Math.random() * 9000) + 1000;
    this.payment_number = `PAY-${date}-${rand}`;
  }

  if (this.appointment_id && !this.appointmentId) this.appointmentId = this.appointment_id;
  if (this.appointmentId && !this.appointment_id) this.appointment_id = this.appointmentId;
  if (this.patient_id && !this.patientId) this.patientId = this.patient_id;
  if (this.patientId && !this.patient_id) this.patient_id = this.patientId;

  next();
});

paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
